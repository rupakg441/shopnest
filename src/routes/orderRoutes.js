import express from 'express';
import { createOrder, getMyOrdersList, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect to all user order endpoints
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getMyOrdersList);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

export default router;
