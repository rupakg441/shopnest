import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearUserCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all cart routes
router.use(protect);

router.route('/')
  .get(getCart)
  .delete(clearUserCart);

router.route('/items')
  .post(addToCart);

router.route('/items/:productId')
  .put(updateCartItem)
  .delete(removeCartItem);

export default router;
