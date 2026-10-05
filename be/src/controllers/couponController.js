import Coupon from '../models/Coupon.js';
import CouponUsage from '../models/CouponUsage.js';
import Cart from '../models/Cart.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCouponValidator, updateCouponValidator, validateCouponValidator } from '../validators/couponValidator.js';

const cartSubtotal = (cart) => (cart?.items || []).reduce((subtotal, item) => {
  const product = item.product;
  if (!product || product.status === 'inactive') return subtotal;
  const color = item.color || '';
  const size = item.size || '';
  const variant = product.variants?.find((entry) => (entry.color || '') === color && (entry.size || '') === size);
  return subtotal + (variant?.price ?? product.discountPrice ?? product.price) * item.quantity;
}, 0);

const getDiscount = (coupon, subtotal) => {
  const raw = coupon.type === 'percentage' ? subtotal * coupon.value / 100 : coupon.value;
  return Number(Math.min(subtotal, coupon.maxDiscount == null ? raw : Math.min(raw, coupon.maxDiscount)).toFixed(2));
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = validateCouponValidator.parse(req.body);
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    const now = new Date();
    if (!coupon || coupon.startsAt > now || coupon.expiresAt <= now || (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit)) {
      return sendError(res, 'Coupon unavailable', ['This coupon is invalid, expired, or has reached its usage limit.'], 422);
    }
    if (await CouponUsage.exists({ coupon: coupon._id, user: req.user._id })) {
      return sendError(res, 'Coupon already used', ['This coupon has already been used on your account.'], 409);
    }
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    const subtotal = Number(cartSubtotal(cart).toFixed(2));
    if (!subtotal) return sendError(res, 'Cart is empty', ['Add products before applying a coupon.'], 422);
    if (subtotal < coupon.minOrderAmount) return sendError(res, 'Minimum order not met', [`This coupon requires an order of at least ${coupon.minOrderAmount.toFixed(2)}.`], 422);
    const discount = getDiscount(coupon, subtotal);
    const tax = Number(((subtotal - discount) * 0.08).toFixed(2));
    return sendSuccess(res, 'Coupon applied', { code: coupon.code, subtotal, discount, tax, totalBeforeShipping: Number((subtotal - discount + tax).toFixed(2)) });
  } catch (error) {
    next(error);
  }
};

export const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).limit(500).lean();
    return sendSuccess(res, 'Coupons retrieved', coupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const data = createCouponValidator.parse(req.body);
    const coupon = await Coupon.create(data);
    return sendSuccess(res, 'Coupon created', coupon, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const data = updateCouponValidator.parse(req.body);
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!coupon) return sendError(res, 'Coupon not found', ['No coupon exists with that ID.'], 404);
    return sendSuccess(res, 'Coupon updated', coupon);
  } catch (error) {
    next(error);
  }
};

export const disableCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!coupon) return sendError(res, 'Coupon not found', ['No coupon exists with that ID.'], 404);
    return sendSuccess(res, 'Coupon disabled', coupon);
  } catch (error) {
    next(error);
  }
};

export { getDiscount };
