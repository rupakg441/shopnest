import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { chatWithAgent, streamChatWithAgent, executeToolAction, getAIProductRecommendations } from '../controllers/aiAgentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Soft-auth middleware that attaches req.user if token is valid without throwing if unauthenticated
const optionalProtect = async (req, res, next) => {
  let token = null;
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    token = authorization.slice(7).trim();
  } else if (req.query.token) {
    token = String(req.query.token).trim();
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      if (userId) {
        req.user = await User.findById(userId).select('-password');
      }
    } catch (_) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

router.post('/chat', optionalProtect, chatWithAgent);
router.get('/stream', optionalProtect, streamChatWithAgent);
router.post('/tool-action', protect, executeToolAction);
router.get('/recommendations', optionalProtect, getAIProductRecommendations);

export default router;
