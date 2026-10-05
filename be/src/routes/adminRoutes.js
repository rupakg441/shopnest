import express from 'express';
import { adjustInventory, exportOrdersCsv, getDashboardStats, getInventory, getInventoryHistory } from '../controllers/adminController.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { getAdminReviews, moderateReview, deleteReview } from '../controllers/reviewController.js';
import { createCoupon, disableCoupon, getAdminCoupons, updateCoupon } from '../controllers/couponController.js';
import { createBanner, createPage, disableBanner, getAdminBanners, getAdminPages, unpublishPage, updateBanner, updatePage } from '../controllers/cmsController.js';
import { getStoreSettings, updateStoreSettings } from '../controllers/storeSettingsController.js';

const router = express.Router();

// Secure all admin routes to require admin privileges
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.route('/settings')
  .get(getStoreSettings)
  .put(updateStoreSettings);
router.get('/reports/orders.csv', exportOrdersCsv);
router.get('/inventory', getInventory);
router.post('/inventory/:id/adjust', adjustInventory);
router.get('/inventory/:id/history', getInventoryHistory);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/status', moderateReview);
router.delete('/reviews/:id', deleteReview);
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', disableCoupon);
router.get('/banners', getAdminBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', disableBanner);
router.get('/pages', getAdminPages);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', unpublishPage);

router.route('/orders')
  .get(getAdminOrders);

router.route('/orders/:id/status')
  .put(updateOrderStatus);

export default router;
