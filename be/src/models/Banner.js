import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  subtitle: { type: String, trim: true, maxlength: 400, default: '' },
  imageUrl: { type: String, required: true, trim: true, maxlength: 2048 },
  ctaLabel: { type: String, trim: true, maxlength: 40, default: '' },
  ctaUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  placement: { type: String, enum: ['home_hero', 'promo'], default: 'home_hero', index: true },
  sortOrder: { type: Number, min: 0, default: 0 },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

bannerSchema.index({ placement: 1, isActive: 1, sortOrder: 1 });
export default mongoose.model('Banner', bannerSchema);
