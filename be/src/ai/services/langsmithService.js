export const initLangSmithObservability = () => {
  if (process.env.LANGCHAIN_TRACING_V2 === 'true' && process.env.LANGCHAIN_API_KEY) {
    process.env.LANGCHAIN_ENDPOINT = process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com';
    process.env.LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || 'ShopNest-AI';
    console.log(`[LangSmith] Observability tracing enabled for project: ${process.env.LANGCHAIN_PROJECT}`);
    return true;
  }
  return false;
};

// Memory store for tracking AI analytics in admin dashboard
const aiMetricsLog = [];

export const recordAIMetric = (metric = {}) => {
  aiMetricsLog.push({
    timestamp: new Date(),
    intent: metric.intent || 'general',
    agent: metric.agent || 'shopping',
    latencyMs: metric.latencyMs || 0,
    tokenCount: metric.tokenCount || 0,
    toolCalls: metric.toolCalls || [],
    success: metric.success ?? true,
    userQuery: metric.userQuery || '',
  });

  // Keep last 1000 metric entries in memory
  if (aiMetricsLog.length > 1000) {
    aiMetricsLog.shift();
  }
};

export const getAIAnalyticsSummary = () => {
  const total = aiMetricsLog.length;
  if (total === 0) {
    return {
      totalConversations: 0,
      avgLatencyMs: 0,
      totalTokenUsage: 0,
      estimatedCost: '$0.00',
      mostCommonIntents: [],
      mostUsedTools: [],
    };
  }

  const avgLatencyMs = Math.round(aiMetricsLog.reduce((acc, m) => acc + m.latencyMs, 0) / total);
  const totalTokenUsage = aiMetricsLog.reduce((acc, m) => acc + m.tokenCount, 0);

  const intentCounts = {};
  const toolCounts = {};

  aiMetricsLog.forEach((m) => {
    intentCounts[m.intent] = (intentCounts[m.intent] || 0) + 1;
    (m.toolCalls || []).forEach((t) => {
      toolCounts[t] = (toolCounts[t] || 0) + 1;
    });
  });

  const mostCommonIntents = Object.entries(intentCounts)
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count);

  const mostUsedTools = Object.entries(toolCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);

  // Estimate token cost ($0.00015 per 1k tokens)
  const estimatedCost = `$${((totalTokenUsage / 1000) * 0.00015).toFixed(4)}`;

  return {
    totalConversations: total,
    avgLatencyMs,
    totalTokenUsage,
    estimatedCost,
    mostCommonIntents,
    mostUsedTools,
  };
};
