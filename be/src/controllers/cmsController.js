import Banner from '../models/Banner.js';
import Page from '../models/Page.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { bannerUpdateValidator, bannerValidator, pageUpdateValidator, pageValidator } from '../validators/cmsValidator.js';

export const getPublicBanners = async (req, res, next) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      placement: req.query.placement === 'promo' ? 'promo' : 'home_hero',
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    }).sort({ sortOrder: 1, createdAt: -1 }).limit(10).lean();
    return sendSuccess(res, 'Banners retrieved', banners);
  } catch (error) { next(error); }
};

export const getPublicPage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug.toLowerCase(), isPublished: true }).select('slug title content updatedAt').lean();
    if (!page) return sendError(res, 'Page not found', ['This page is not published.'], 404);
    return sendSuccess(res, 'Page retrieved', page);
  } catch (error) { next(error); }
};

export const getAdminBanners = async (_req, res, next) => {
  try { return sendSuccess(res, 'Banners retrieved', await Banner.find({}).sort({ placement: 1, sortOrder: 1 }).limit(500).lean()); }
  catch (error) { next(error); }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(bannerValidator.parse(req.body));
    return sendSuccess(res, 'Banner created', banner, 201);
  } catch (error) { next(error); }
};

export const updateBanner = async (req, res, next) => {
  try {
    const data = bannerUpdateValidator.parse(req.body);
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!banner) return sendError(res, 'Banner not found', ['No banner exists with that ID.'], 404);
    return sendSuccess(res, 'Banner updated', banner);
  } catch (error) { next(error); }
};

export const disableBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!banner) return sendError(res, 'Banner not found', ['No banner exists with that ID.'], 404);
    return sendSuccess(res, 'Banner disabled', banner);
  } catch (error) { next(error); }
};

export const getAdminPages = async (_req, res, next) => {
  try { return sendSuccess(res, 'Pages retrieved', await Page.find({}).sort({ slug: 1 }).limit(500).lean()); }
  catch (error) { next(error); }
};

export const createPage = async (req, res, next) => {
  try {
    const page = await Page.create({ ...pageValidator.parse(req.body), updatedBy: req.user._id });
    return sendSuccess(res, 'Page created', page, 201);
  } catch (error) { next(error); }
};

export const updatePage = async (req, res, next) => {
  try {
    const data = pageUpdateValidator.parse(req.body);
    const page = await Page.findByIdAndUpdate(req.params.id, { ...data, updatedBy: req.user._id }, { new: true, runValidators: true });
    if (!page) return sendError(res, 'Page not found', ['No page exists with that ID.'], 404);
    return sendSuccess(res, 'Page updated', page);
  } catch (error) { next(error); }
};

export const unpublishPage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, { isPublished: false, updatedBy: req.user._id }, { new: true });
    if (!page) return sendError(res, 'Page not found', ['No page exists with that ID.'], 404);
    return sendSuccess(res, 'Page unpublished', page);
  } catch (error) { next(error); }
};
