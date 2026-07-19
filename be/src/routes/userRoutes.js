import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getMyOrders,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// User profile routes
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.put('/me/password', protect, updateUserPassword);
router.get('/me/orders', protect, getMyOrders);

// Admin-only user management routes
router.route('/')
  .get(protect, adminOnly, getAllUsers);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

export default router;
