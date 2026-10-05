import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { chatWithShopNestAgents } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', protect, chatWithShopNestAgents);

export default router;