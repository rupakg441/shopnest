import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import { generateEmbedding } from '../embeddings/embeddingService.js';
import { seedDefaultKnowledgeDocs } from '../services/knowledgeBaseService.js';

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

export const queryKnowledgeBase = async (queryText, options = {}) => {
  await seedDefaultKnowledgeDocs();

  const limit = options.limit || 4;
  const category = options.category;

  const queryVector = await generateEmbedding(queryText);

  const filter = { isActive: true };
  if (category) filter.category = category;

  const docs = await KnowledgeDocument.find(filter).select('+embedding');

  const scoredDocs = docs
    .map((doc) => {
      const score = doc.embedding && doc.embedding.length ? cosineSimilarity(queryVector, doc.embedding) : 0;
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // If top vector score is weak, fallback to text search
  if (!scoredDocs.length || scoredDocs[0].score < 0.25) {
    const textMatches = await KnowledgeDocument.find({
      ...filter,
      $text: { $search: queryText },
    }).limit(limit);

    if (textMatches.length) {
      return {
        documents: textMatches,
        contextText: textMatches.map((d) => `[${d.title}]: ${d.content}`).join('\n\n'),
        sources: textMatches.map((d) => ({ id: d._id.toString(), title: d.title, category: d.category, type: 'rag' })),
      };
    }
  }

  const selected = scoredDocs.map((item) => item.doc);

  return {
    documents: selected,
    contextText: selected.map((d) => `[${d.title}]: ${d.content}`).join('\n\n'),
    sources: selected.map((d) => ({ id: d._id.toString(), title: d.title, category: d.category, type: 'rag' })),
  };
};
