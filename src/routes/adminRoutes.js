import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Secure all admin routes to require admin privileges
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

router.route('/orders')
  .get(getAdminOrders);

router.route('/orders/:id/status')
  .put(updateOrderStatus);

export default router;
