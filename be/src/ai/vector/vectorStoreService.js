import { Pinecone } from '@pinecone-database/pinecone';
import ProductEmbedding from '../../models/ProductEmbedding.js';
import Product from '../../models/Product.js';
import { getEmbeddingsModel } from '../config/llmConfig.js';

let pineconeIndex = null;

const getPineconeIndex = () => {
  if (pineconeIndex) return pineconeIndex;
  if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME) {
    try {
      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
      return pineconeIndex;
    } catch (err) {
      console.warn('[VectorStoreService] Pinecone init failed, using local MongoDB vector store:', err.message);
    }
  }
  return null;
};

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const upsertProductVectors = async (items = []) => {
  const index = getPineconeIndex();
  if (index) {
    try {
      await index.upsert(
        items.map((item) => ({
          id: item.id,
          values: item.vector,
          metadata: item.metadata,
        }))
      );
      return { success: true, provider: 'pinecone' };
    } catch (error) {
      console.warn('[VectorStoreService] Pinecone upsert failed, fell back to local store:', error.message);
    }
  }
  return { success: true, provider: 'mongodb_local' };
};

export const similaritySearch = async ({ queryText = '', filter = {}, limit = 10 }) => {
  try {
    let queryVector;
    try {
      const embeddings = getEmbeddingsModel();
      queryVector = await embeddings.embedQuery(queryText);
    } catch (embErr) {
      console.warn('[VectorStoreService] Embedding provider failed, using FallbackEmbeddings:', embErr.message);
      const fallback = new FallbackEmbeddings();
      queryVector = await fallback.embedQuery(queryText);
    }

    const index = getPineconeIndex();
    if (index) {
      try {
        const pineconeFilter = {};
        if (filter.category) pineconeFilter.category = { $eq: filter.category };
        if (filter.brand) pineconeFilter.brand = { $eq: filter.brand };
        if (filter.maxPrice) pineconeFilter.price = { $lte: Number(filter.maxPrice) };
        if (filter.minPrice) pineconeFilter.price = { $gte: Number(filter.minPrice) };

        const queryRes = await index.query({
          vector: queryVector,
          topK: limit,
          includeMetadata: true,
          filter: Object.keys(pineconeFilter).length ? pineconeFilter : undefined,
        });

        const productIds = queryRes.matches.map((m) => m.metadata?.productId || m.id).filter(Boolean);
        const dbProducts = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

        const results = queryRes.matches
          .map((match) => {
            const id = match.metadata?.productId || match.id;
            const product = productMap.get(id);
            return product ? { product, score: match.score } : null;
          })
          .filter(Boolean);

        if (results.length) return results;
      } catch (err) {
        console.warn('[VectorStoreService] Pinecone search failed, using local similarity search:', err.message);
      }
    }

    // Local MongoDB Vector Search Fallback
    const mongoFilter = {};
    if (filter.category) mongoFilter.category = filter.category;
    if (filter.brand) mongoFilter.brand = filter.brand;
    if (filter.maxPrice) mongoFilter.price = { ...mongoFilter.price, $lte: Number(filter.maxPrice) };
    if (filter.minPrice) mongoFilter.price = { ...mongoFilter.price, $gte: Number(filter.minPrice) };

    const storedEmbeddings = await ProductEmbedding.find(mongoFilter).select('+embedding').populate('product');

    const scored = storedEmbeddings
      .filter((e) => e && e.product && (e.product._id || e.product.id))
      .map((e) => {
        const score = cosineSimilarity(queryVector, e.embedding);
        return { product: e.product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  } catch (err) {
    console.error('[VectorStoreService] similaritySearch error:', err.message);
    return [];
  }
};

export const hybridSearch = async ({ queryText = '', filter = {}, limit = 10 }) => {
  try {
    const vectorResults = await similaritySearch({ queryText, filter, limit });

    if (vectorResults.length >= limit) {
      return vectorResults;
    }

    const safeQuery = String(queryText || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const words = safeQuery.split(/\s+/).filter(Boolean);
    const regexPattern = words.length ? words.join('|') : safeQuery;
    const regex = new RegExp(regexPattern, 'i');

    const kwFilter = {
      $or: [{ title: regex }, { description: regex }, { category: regex }, { brand: regex }, { tags: regex }],
    };

    if (filter.category) kwFilter.category = filter.category;
    if (filter.brand) kwFilter.brand = filter.brand;
    if (filter.maxPrice) kwFilter.price = { ...kwFilter.price, $lte: Number(filter.maxPrice) };
    if (filter.minPrice) kwFilter.price = { ...kwFilter.price, $gte: Number(filter.minPrice) };

    const kwProducts = await Product.find(kwFilter).limit(limit);

    const resultMap = new Map();
    (vectorResults || []).forEach((r) => {
      if (r && r.product && (r.product._id || r.product.id)) {
        const idStr = (r.product._id || r.product.id).toString();
        resultMap.set(idStr, r);
      }
    });

    (kwProducts || []).forEach((p) => {
      if (p && (p._id || p.id)) {
        const idStr = (p._id || p.id).toString();
        if (!resultMap.has(idStr)) {
          resultMap.set(idStr, { product: p, score: 0.5 });
        }
      }
    });

    return Array.from(resultMap.values()).slice(0, limit);
  } catch (err) {
    console.error('[VectorStoreService] hybridSearch error:', err.message);
    try {
      const fallbackProducts = await Product.find({}).limit(limit);
      return fallbackProducts.map((p) => ({ product: p, score: 0.5 }));
    } catch (_) {
      return [];
    }
  }
};
