import { z } from 'zod';
import { answerWithAgents } from '../ai/agentOrchestrator.js';
import { sendSuccess } from '../utils/apiResponse.js';

const chatValidator = z.object({
  message: z.string().trim().min(1).max(1000)
});

export const chatWithShopNestAgents = async (req, res, next) => {
  try {
    const { message } = chatValidator.parse(req.body);
    const result = await answerWithAgents({ message, user: req.user });
    return sendSuccess(res, 'Assistant response generated', result);
  } catch (error) {
    next(error);
  }
};