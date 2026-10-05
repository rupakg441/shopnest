import express from 'express';
import { getPublicBanners, getPublicPage } from '../controllers/cmsController.js';
import { getPublicStoreSettings } from '../controllers/storeSettingsController.js';

const router = express.Router();
router.get('/banners', getPublicBanners);
router.get('/pages/:slug', getPublicPage);
router.get('/store-settings', getPublicStoreSettings);
export default router;
