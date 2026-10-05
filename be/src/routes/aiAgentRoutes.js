import express from 'express';
import { chatWithAgent, streamChatWithAgent, executeToolAction, getAIProductRecommendations } from '../controllers/aiAgentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Soft-auth middleware that attaches req.user if token is valid without throwing if unauthenticated
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  req.user = null;
  next();
};

router.post('/chat', optionalProtect, chatWithAgent);
router.get('/stream', optionalProtect, streamChatWithAgent);
router.post('/tool-action', protect, executeToolAction);
router.get('/recommendations', optionalProtect, getAIProductRecommendations);

export default router;
