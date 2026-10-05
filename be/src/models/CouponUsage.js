import mongoose from 'mongoose';

const couponUsageSchema = new mongoose.Schema({
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });

couponUsageSchema.index({ coupon: 1, user: 1 }, { unique: true });
couponUsageSchema.index({ order: 1 }, { sparse: true });
export default mongoose.model('CouponUsage', couponUsageSchema);
