import { runShoppingAgent } from './graphs/shoppingAgentGraph.js';

export const answerWithAgents = async ({ message, user }) => {
  const result = await runShoppingAgent({ userMessage: message, user });
  return {
    answer: result.answer,
    agent: result.intent || 'shopping',
    handoff: false,
    products: result.products || [],
    sources: result.sources || [],
    requiresConfirmation: result.requiresConfirmation,
    confirmationData: result.confirmationData,
  };
};
