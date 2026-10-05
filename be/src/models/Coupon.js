import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true, minlength: 3, maxlength: 40 },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0.01 },
  minOrderAmount: { type: Number, min: 0, default: 0 },
  maxDiscount: { type: Number, min: 0, default: null },
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  usageLimit: { type: Number, min: 0, default: 0 },
  usageCount: { type: Number, min: 0, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

couponSchema.index({ code: 1, isActive: 1, expiresAt: 1 });
export default mongoose.model('Coupon', couponSchema);
