import express from 'express';
import { getProducts, getAdminProducts, getProductFilters, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { getProductReviews, createProductReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.get('/admin', protect, adminOnly, getAdminProducts);
router.get('/filters', getProductFilters);

router.route('/:productId/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;
