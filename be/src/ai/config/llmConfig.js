import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

/**
 * Deterministic local embedding generator used as a non-breaking fallback when API keys are unconfigured.
 */
export class FallbackEmbeddings {
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

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_ENABLED !== 'false') {
    return new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature,
      streaming,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && process.env.GEMINI_ENABLED !== 'false' && geminiKey.startsWith('AIzaSy')) {
    return new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      temperature,
      apiKey: geminiKey,
    });
  }

  return null;
};

export const getEmbeddingsModel = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_ENABLED !== 'false') {
    return new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && process.env.GEMINI_ENABLED !== 'false' && geminiKey.startsWith('AIzaSy')) {
    return new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004',
      apiKey: geminiKey,
    });
  }

  return new FallbackEmbeddings();
};
