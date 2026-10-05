import express from 'express';
import {
  registerUser,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  loginUser,
  loginAdmin,
  refreshSession,
  getMe,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimit } from '../middleware/authRateLimit.js';

const router = express.Router();

router.post('/register', authRateLimit, registerUser);
router.post('/login', authRateLimit, loginUser);
router.post('/admin/login', authRateLimit, loginAdmin);
router.post('/refresh', refreshSession);
router.post('/verify-email', authRateLimit, verifyEmail);
router.post('/resend-verification', authRateLimit, resendVerification);
router.post('/forgot-password', authRateLimit, requestPasswordReset);
router.post('/reset-password', authRateLimit, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);

export default router;
