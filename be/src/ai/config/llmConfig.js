import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

/**
 * Deterministic local embedding generator used as a non-breaking fallback when API keys are unconfigured.
 */
class FallbackEmbeddings {
  constructor(dim = 384) {
    this.dim = dim;
  }

  async embedDocuments(texts) {
    return Promise.all(texts.map((t) => this.embedQuery(t)));
  }

  async embedQuery(text) {
    const vector = new Array(this.dim).fill(0);
    const words = String(text || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let c = 0; c < word.length; c++) {
        hash = (hash << 5) - hash + word.charCodeAt(c);
        hash |= 0;
      }
      const idx = Math.abs(hash) % this.dim;
      vector[idx] += 1 / (i + 1);
    }
    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((val) => Number((val / norm).toFixed(6)));
  }
}

export const getChatModel = (options = {}) => {
  const temperature = options.temperature ?? 0.2;
  const streaming = options.streaming ?? false;

  if (process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature,
      streaming,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      temperature,
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });
  }

  console.warn('[AI Provider] Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured. AI operations will use grounded fallbacks.');
  return null;
};

export const getEmbeddingsModel = () => {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004',
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });
  }

  return new FallbackEmbeddings();
};
