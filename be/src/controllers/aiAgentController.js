import { z } from 'zod';
import { runShoppingAgent } from '../ai/graphs/shoppingAgentGraph.js';
import { getPersonalizedRecommendations } from '../ai/services/recommendationService.js';
import { createEcommerceTools } from '../ai/tools/ecommerceTools.js';
import { recordAIMetric } from '../ai/services/langsmithService.js';
import { sendSuccess } from '../utils/apiResponse.js';

const chatValidator = z.object({
  message: z.string().trim().min(1).max(1500),
});

const toolExecutionValidator = z.object({
  toolName: z.string().trim().min(1),
  args: z.record(z.any()).default({}),
});

export const chatWithAgent = async (req, res, next) => {
  try {
    const { message } = chatValidator.parse(req.body);
    const result = await runShoppingAgent({ userMessage: message, user: req.user });

    recordAIMetric({
      intent: result.intent,
      latencyMs: result.latencyMs,
      tokenCount: Math.round(message.length / 4 + result.answer.length / 4),
      toolCalls: result.sources.map((s) => s.title),
      userQuery: message,
    });

    return sendSuccess(res, 'AI assistant response generated', result);
  } catch (error) {
    next(error);
  }
};

export const streamChatWithAgent = async (req, res, next) => {
  try {
    const { message } = chatValidator.parse(req.query);

    // Setup Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendSSE = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    sendSSE('status', { message: 'Understanding intent & query...' });
    await new Promise((r) => setTimeout(r, 200));

    sendSSE('status', { message: 'Searching catalog & knowledge base...' });

    const result = await runShoppingAgent({ userMessage: message, user: req.user });

    sendSSE('status', { message: 'Formulating grounded answer...' });
    await new Promise((r) => setTimeout(r, 150));

    // Stream the final answer word-by-word
    const words = result.answer.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      sendSSE('chunk', { text: chunk });
      await new Promise((r) => setTimeout(r, 40));
    }

    sendSSE('done', {
      intent: result.intent,
      products: result.products,
      sources: result.sources,
      requiresConfirmation: result.requiresConfirmation,
      confirmationData: result.confirmationData,
    });

    recordAIMetric({
      intent: result.intent,
      latencyMs: result.latencyMs,
      tokenCount: Math.round(message.length / 4 + result.answer.length / 4),
      toolCalls: result.sources.map((s) => s.title),
      userQuery: message,
    });

    return res.end();
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  }
};

export const executeToolAction = async (req, res, next) => {
  try {
    const { toolName, args } = toolExecutionValidator.parse(req.body);
    const tools = createEcommerceTools(req.user);
    const targetTool = tools.find((t) => t.name === toolName);

    if (!targetTool) {
      return res.status(404).json({ success: false, message: `Tool '${toolName}' not found.` });
    }

    const toolResultStr = await targetTool.func(args);
    let parsedResult = toolResultStr;
    try {
      parsedResult = JSON.parse(toolResultStr);
    } catch (_) {}

    return sendSuccess(res, `Executed tool ${toolName}`, { toolName, result: parsedResult });
  } catch (error) {
    next(error);
  }
};

export const getAIProductRecommendations = async (req, res, next) => {
  try {
    const { category, productId, limit } = req.query;
    const recommendations = await getPersonalizedRecommendations({
      userId: req.user?._id,
      category,
      productId,
      limit: limit ? Number(limit) : 6,
    });
    return sendSuccess(res, 'AI recommendations retrieved', recommendations);
  } catch (error) {
    next(error);
  }
};
