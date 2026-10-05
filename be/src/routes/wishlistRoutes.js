import express from 'express';
import { getWishlist, addWishlistItem, removeWishlistItem, clearWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getWishlist).delete(clearWishlist);
router.post('/items', addWishlistItem);
router.delete('/items/:productId', removeWishlistItem);

export default router;
