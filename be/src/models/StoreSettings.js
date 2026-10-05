import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'store', unique: true, immutable: true },
  storeName: { type: String, trim: true, minlength: 2, maxlength: 80, default: 'ShopNest' },
  supportEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
  supportPhone: { type: String, trim: true, maxlength: 40, default: '' },
  announcement: { type: String, trim: true, maxlength: 240, default: '' },
  announcementEnabled: { type: Boolean, default: false },
}, { timestamps: true });

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;
