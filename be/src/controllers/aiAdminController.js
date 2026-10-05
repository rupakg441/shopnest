import { z } from 'zod';
import { generateAdminProductContent } from '../ai/services/generativeAdminService.js';
import { addOrUpdateKnowledgeDoc, deleteKnowledgeDoc, listKnowledgeDocs } from '../ai/services/knowledgeBaseService.js';
import { indexAllProducts } from '../ai/embeddings/embeddingService.js';
import { getAIAnalyticsSummary } from '../ai/services/langsmithService.js';
import { sendSuccess } from '../utils/apiResponse.js';

const generateValidator = z.object({
  title: z.string().trim().min(1),
  category: z.string().optional(),
  brand: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  currentDescription: z.string().optional(),
});

export const generateAIContent = async (req, res, next) => {
  try {
    const payload = generateValidator.parse(req.body);
    const content = await generateAdminProductContent(payload);
    return sendSuccess(res, 'AI content generated successfully', content);
  } catch (error) {
    next(error);
  }
};

export const getAIAnalytics = async (req, res, next) => {
  try {
    const analytics = getAIAnalyticsSummary();
    return sendSuccess(res, 'AI analytics summary retrieved', analytics);
  } catch (error) {
    next(error);
  }
};

export const fetchKnowledgeDocs = async (req, res, next) => {
  try {
    const docs = await listKnowledgeDocs(req.query.category);
    return sendSuccess(res, 'Knowledge documents retrieved', docs);
  } catch (error) {
    next(error);
  }
};

export const saveKnowledgeDoc = async (req, res, next) => {
  try {
    const doc = await addOrUpdateKnowledgeDoc(req.body);
    return sendSuccess(res, 'Knowledge document saved and indexed', doc);
  } catch (error) {
    next(error);
  }
};

export const removeKnowledgeDoc = async (req, res, next) => {
  try {
    await deleteKnowledgeDoc(req.params.id);
    return sendSuccess(res, 'Knowledge document removed successfully');
  } catch (error) {
    next(error);
  }
};

export const reindexCatalogVectors = async (req, res, next) => {
  try {
    const result = await indexAllProducts();
    return sendSuccess(res, 'Catalog products re-indexed into vector database', result);
  } catch (error) {
    next(error);
  }
};
