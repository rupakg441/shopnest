import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

/**
 * Return the configured chat model, keeping provider configuration out of the
 * agent workflow. A null result means the assistant should use its local
 * grounded fallback response.
 */
export const createChatModel = () => {
  if (process.env.GEMINI_ENABLED === 'true' && process.env.GOOGLE_API_KEY) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      temperature: 0.2,
      maxOutputTokens: 500,
    });
  }

  if (process.env.OPENAI_ENABLED === 'true' && process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
    });
  }

  return null;
};
