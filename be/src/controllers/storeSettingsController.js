import StoreSettings from '../models/StoreSettings.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { updateStoreSettingsValidator } from '../validators/storeSettingsValidator.js';

const DEFAULTS = {
  key: 'store',
  storeName: 'ShopNest',
  supportEmail: '',
  supportPhone: '',
  announcement: '',
  announcementEnabled: false,
};

export const getStoreSettings = async (_req, res, next) => {
  try {
    const settings = await StoreSettings.findOneAndUpdate(
      { key: 'store' },
      { $setOnInsert: DEFAULTS },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    ).lean();
    return sendSuccess(res, 'Store settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

export const getPublicStoreSettings = async (_req, res, next) => {
  try {
    const settings = await StoreSettings.findOne({ key: 'store' }).select('storeName supportEmail supportPhone announcement announcementEnabled').lean();
    return sendSuccess(res, 'Public store settings retrieved', {
      storeName: settings?.storeName || DEFAULTS.storeName,
      supportEmail: settings?.supportEmail || '',
      supportPhone: settings?.supportPhone || '',
      announcement: settings?.announcement || '',
      announcementEnabled: settings?.announcementEnabled ?? false,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStoreSettings = async (req, res, next) => {
  try {
    const fields = updateStoreSettingsValidator.safeParse(req.body);
    if (!fields.success) {
      return sendError(res, 'Invalid store settings', fields.error.issues.map((issue) => issue.message), 422);
    }
    const settings = await StoreSettings.findOneAndUpdate(
      { key: 'store' },
      { $set: fields.data, $setOnInsert: { key: 'store' } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    ).lean();
    return sendSuccess(res, 'Store settings saved', settings);
  } catch (error) {
    next(error);
  }
};
