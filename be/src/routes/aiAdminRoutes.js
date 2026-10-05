import express from 'express';
import { generateAIContent, getAIAnalytics, fetchKnowledgeDocs, saveKnowledgeDoc, removeKnowledgeDoc, reindexCatalogVectors } from '../controllers/aiAdminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Protect all admin AI routes with authentication and admin privileges
router.use(protect, adminOnly);

router.post('/generate-content', generateAIContent);
router.get('/analytics', getAIAnalytics);

router.route('/knowledge')
  .get(fetchKnowledgeDocs)
  .post(saveKnowledgeDoc);

router.delete('/knowledge/:id', removeKnowledgeDoc);
router.post('/reindex-catalog', reindexCatalogVectors);

export default router;
