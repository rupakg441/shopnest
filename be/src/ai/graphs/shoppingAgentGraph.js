import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getChatModel } from '../config/llmConfig.js';
import { queryKnowledgeBase } from '../rag/ragService.js';
import { createEcommerceTools } from '../tools/ecommerceTools.js';
import { sanitizeUserPrompt, wrapDataBoundary } from '../security/promptProtection.js';

const classifyIntent = (message = '') => {
  const text = message.toLowerCase();
  if (/cancel/i.test(text)) return 'cancel_order';
  if (/compare/i.test(text)) return 'compare';
  if (/order|tracking|delivery|shipping status|purchase/i.test(text)) return 'orders';
  if (/return|refund|polic(?:y|ies)|discount|coupon|warranty|shipping|hours|support|call|contact|phone/i.test(text)) return 'policies';
  if (/laptop|phone|shoe|shirt|dress|buy|recommend|similar|price|stock|specs|best|vase|lamp/i.test(text)) return 'shopping';
  return 'general';
};

export const runShoppingAgent = async ({ userMessage, user }) => {
  const startTime = Date.now();
  const cleanPrompt = sanitizeUserPrompt(userMessage);
  const intent = classifyIntent(cleanPrompt);
  const tools = createEcommerceTools(user);

  let products = [];
  let retrievedDocuments = [];
  let toolResults = [];
  let sources = [];
  let requiresConfirmation = false;
  let confirmationData = null;

  // 1. Order Cancellation Intent
  if (intent === 'cancel_order') {
    const cancelTool = tools.find((t) => t.name === 'cancelOrder');
    const orderMatch = cleanPrompt.match(/SN-\d+|[0-9a-fA-F]{24}/i);
    const orderIdentifier = orderMatch ? orderMatch[0] : '';

    if (cancelTool && orderIdentifier) {
      try {
        const resStr = await cancelTool.func({ orderIdentifier, confirmed: false });
        let parsed = resStr;
        try { parsed = JSON.parse(resStr); } catch (_) {}

        if (typeof parsed === 'object' && parsed.requiresConfirmation) {
          requiresConfirmation = true;
          confirmationData = parsed;
          toolResults.push({ tool: 'cancelOrder', result: parsed.message });
        } else {
          toolResults.push({ tool: 'cancelOrder', result: typeof parsed === 'string' ? parsed : parsed.message });
        }
        sources.push({ id: 'cancel_order_tool', title: 'Order Cancellation Tool', type: 'tool' });
      } catch (err) {
        console.warn('[LangGraph] Cancel tool execution error:', err.message);
      }
    }
  }

  // 2. Product Comparison Intent
  if (intent === 'compare') {
    const compareTool = tools.find((t) => t.name === 'compareProducts');
    if (compareTool) {
      const items = cleanPrompt
        .replace(/compare/i, '')
        .split(/\band\b|,/i)
        .map((s) => s.trim())
        .filter(Boolean);

      if (items.length >= 2) {
        try {
          const resStr = await compareTool.func({ identifiers: items });
          toolResults.push({ tool: 'compareProducts', result: resStr });
          sources.push({ id: 'compare_tool', title: 'Product Comparison Tool', type: 'tool' });
        } catch (err) {
          console.warn('[LangGraph] Compare tool execution error:', err.message);
        }
      }
    }
  }

  // 3. Order History / Order Status Intent
  if (intent === 'orders') {
    const ordersTool = tools.find((t) => t.name === 'getUserOrders');
    if (ordersTool) {
      try {
        const resStr = await ordersTool.func({ limit: 5 });
        toolResults.push({ tool: 'getUserOrders', result: resStr });
        sources.push({ id: 'user_orders', title: 'User Account Orders', type: 'tool' });
      } catch (err) {
        console.warn('[LangGraph] Orders tool execution error:', err.message);
      }
    }
  }

  // 4. Policies, FAQs, Customer Service Contact Intent
  if (intent === 'policies' || intent === 'general') {
    const categoryFilter = /return|refund/i.test(cleanPrompt)
      ? 'return_policy'
      : /shipping|delivery/i.test(cleanPrompt)
      ? 'shipping_policy'
      : undefined;

    const ragRes = await queryKnowledgeBase(cleanPrompt, { category: categoryFilter, limit: 4 });
    retrievedDocuments = ragRes.documents || [];
    sources.push(...(ragRes.sources || []));
  }

  // 5. Product Search Intent
  if (intent === 'shopping' || intent === 'general') {
    const semanticTool = tools.find((t) => t.name === 'searchSemanticProducts');
    if (semanticTool) {
      try {
        const toolResStr = await semanticTool.func({ naturalLanguageQuery: cleanPrompt, limit: 6 });
        const parsed = JSON.parse(toolResStr);
        if (Array.isArray(parsed)) {
          products = parsed;
          sources.push({ id: 'catalog_search', title: 'Catalog Vector Search', type: 'tool' });
        }
      } catch (err) {
        console.warn('[LangGraph] Semantic search tool error:', err.message);
      }
    }
  }

  // 6. Build Grounded Context
  const contextParts = [];
  if (retrievedDocuments.length) {
    contextParts.push(wrapDataBoundary('Official Policies & Knowledge Base Docs', retrievedDocuments.map((d) => `[${d.title}]: ${d.content}`).join('\n\n')));
  }
  if (products.length) {
    contextParts.push(wrapDataBoundary('Catalog Products Matches', products));
  }
  if (toolResults.length) {
    contextParts.push(wrapDataBoundary('Tool Execution Results', toolResults));
  }

  const groundedContext = contextParts.join('\n\n');

  // 7. Grounded Answer Calculation
  let finalAnswer = '';

  if (requiresConfirmation && confirmationData) {
    finalAnswer = confirmationData.message || `Order ${confirmationData.orderIdentifier} is eligible for cancellation. Please confirm if you want to proceed.`;
  } else if (toolResults.some((t) => t.tool === 'compareProducts')) {
    const compRes = toolResults.find((t) => t.tool === 'compareProducts').result;
    finalAnswer = `Here is the comparison between the requested items:\n\n${compRes}`;
  } else if (intent === 'cancel_order') {
    const cancelRes = toolResults.find((t) => t.tool === 'cancelOrder');
    finalAnswer = cancelRes ? cancelRes.result : 'Please share your Order Number (e.g. SN-741407) so I can help you cancel it.';
  } else if (intent === 'orders') {
    const orderRes = toolResults.find((t) => t.tool === 'getUserOrders');
    if (!user) {
      finalAnswer = 'Please log in to your ShopNest account to view or track your orders.';
    } else if (orderRes && orderRes.result.includes('No orders')) {
      finalAnswer = 'You currently have no orders placed on your account.';
    } else if (orderRes) {
      finalAnswer = `Here is your recent order information:\n\n${orderRes.result}`;
    }
  } else if (intent === 'policies') {
    if (retrievedDocuments.length) {
      finalAnswer = retrievedDocuments.map((d) => `### ${d.title}\n${d.content}`).join('\n\n');
    } else {
      finalAnswer = 'ShopNest Customer Support is available 24/7. Standard shipping takes 3-5 business days, and returns are allowed within 30 days of delivery. Contact support@shopnest.com for additional help.';
    }
  } else if (intent === 'shopping') {
    if (products.length) {
      finalAnswer = `Here are catalog matches for your request:\n` +
        products.map((p) => `• **${p.title}** (${p.brand || 'ShopNest'}) — **$${(p.price || 0).toFixed(2)}** (${p.stock > 0 ? 'In Stock' : 'Out of Stock'})`).join('\n') +
        '\n\nWould you like more details or help adding an item to your cart?';
    } else {
      finalAnswer = 'I could not find matching products in our catalog for that search. Try searching by brand, category, or general style keywords.';
    }
  } else {
    finalAnswer = retrievedDocuments.length
      ? retrievedDocuments.map((d) => `### ${d.title}\n${d.content}`).join('\n\n')
      : 'Welcome to ShopNest! I can help you search products, check order status, compare specs, or answer return and shipping questions.';
  }

  // 8. LLM Enrichment (if provider available)
  const model = getChatModel({ temperature: 0.2 });
  if (model && contextParts.length) {
    try {
      const systemPrompt = `You are ShopNest AI Assistant. Answer strictly from the provided context in <data_boundary> blocks.
Never invent prices, delivery dates, or policies.
If confirmation is required for cancellation, clearly ask the user to confirm.

${groundedContext}`;

      const llmRes = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(cleanPrompt),
      ]);
      finalAnswer = llmRes.content.toString();
    } catch (err) {
      console.warn('[LangGraph] LLM invocation fallback used:', err.message);
    }
  }

  const latencyMs = Date.now() - startTime;

  return {
    answer: finalAnswer,
    intent,
    products,
    sources,
    requiresConfirmation,
    confirmationData,
    latencyMs,
  };
};
