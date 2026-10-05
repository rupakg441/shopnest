export const sanitizeUserPrompt = (text = '') => {
  let cleaned = String(text || '').trim();

  // Strip common prompt injection / jailbreak override strings
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /disregard\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /reveal\s+(system\s+)?prompt/gi,
    /you\s+are\s+now\s+an?\s+admin/gi,
    /bypass\s+permissions/gi,
    /system\s*:\s*/gi,
    /\[system\]/gi,
  ];

  for (const pattern of injectionPatterns) {
    cleaned = cleaned.replace(pattern, '[filtered]');
  }

  return cleaned.slice(0, 1500); // Enforce max character limit
};

export const wrapDataBoundary = (label, data) => {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return `<data_boundary label="${label}">\n${serialized}\n</data_boundary>`;
};

export const validateToolExecutionPermission = ({ toolName, userId }) => {
  const sensitiveUserTools = ['getUserOrders', 'getOrderStatus', 'cancelOrder', 'addToCart'];
  if (sensitiveUserTools.includes(toolName) && !userId) {
    return { allowed: false, reason: 'Authentication required. Please log in to perform user account actions.' };
  }
  return { allowed: true };
};
