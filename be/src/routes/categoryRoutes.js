import express from 'express';
import { getCategories, getAdminCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, createCategory);

router.get('/admin', protect, adminOnly, getAdminCategories);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

export default router;
