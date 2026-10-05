import express from 'express';
import { uploadCategoryImage, uploadProductImages } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { uploadCategoryImage as parseCategoryImage, uploadProductImages as parseProductImages } from '../middleware/imageUpload.js';

const router = express.Router();
router.post('/products', protect, adminOnly, parseProductImages, uploadProductImages);
router.post('/categories', protect, adminOnly, parseCategoryImage, uploadCategoryImage);

export default router;
