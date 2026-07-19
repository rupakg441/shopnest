import express from 'express';
import { updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all review updates
router.use(protect);

router.route('/:id')
  .put(updateReview)
  .delete(deleteReview);

export default router;
