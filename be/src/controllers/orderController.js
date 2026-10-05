import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import StockHistory from '../models/StockHistory.js';
import Coupon from '../models/Coupon.js';
import CouponUsage from '../models/CouponUsage.js';
import { getDiscount } from './couponController.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createOrderValidator } from '../validators/orderValidator.js';

const adjustStock = async ({ productId, quantity, color = '', size = '', variantSku = '', hasVariant = false, delta, reason, actor }) => {
  const filter = { _id: productId, stock: { $gte: Math.max(0, -delta) } };
  const update = { $inc: { stock: delta } };
  const options = {};
  if (hasVariant) {
    const variantMatch = variantSku ? { sku: variantSku } : { color: color || null, size: size || null };
    filter.variants = { $elemMatch: { ...variantMatch, stock: { $gte: Math.max(0, -delta) } } };
    update.$inc['variants.$[target].stock'] = delta;
    options.arrayFilters = [{ ...Object.fromEntries(Object.entries(variantMatch).map(([key, value]) => [`target.${key}`, value])) }];
  }
  const product = await Product.findOneAndUpdate(filter, update, { new: true, ...options });
  if (!product) return null;
  const variant = hasVariant && (variantSku
    ? product.variants.find((entry) => entry.sku === variantSku)
    : product.variants.find((entry) => (entry.color || '') === color && (entry.size || '') === size));
  const stockAfter = variant ? variant.stock : product.stock;
  try {
    await StockHistory.create({ product: product._id, variantSku, delta, stockBefore: stockAfter - delta, stockAfter, reason, actor });
  } catch (error) {
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -delta, ...(variant ? { 'variants.$[target].stock': -delta } : {}) } },
      variant ? { arrayFilters: [{ ...(variantSku ? { 'target.sku': variantSku } : { 'target.color': color || null, 'target.size': size || null }) }] } : {});
    throw error;
  }
  return product;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const validatedData = createOrderValidator.parse(req.body);
    const { items, customer, shippingMethod, paymentMethod, couponCode } = validatedData;

    let subtotal = 0;
    const orderItems = [];
    const stockAdjustments = [];

    // 1. Fetch current products & verify stock and prices in MongoDB
    for (const item of items) {
      let product;
      if (item.id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(item.id);
      } else {
        product = await Product.findOne({ id: item.id });
      }

      if (!product || product.status === 'inactive') {
        return sendError(res, 'Product not found', [`Product with ID ${item.id} does not exist.`], 404);
      }

      const variant = product.variants?.find((entry) =>
        (entry.color || '') === (item.color || '') && (entry.size || '') === (item.size || '')
      );
      if (product.variants?.length && !variant) {
        return sendError(res, 'Invalid product option', [`Selected option for ${product.title} is unavailable.`], 400);
      }
      const unitPrice = variant?.price ?? product.discountPrice ?? product.price;
      const availableStock = variant?.stock ?? product.stock;

      if (availableStock < item.quantity) {
        return sendError(res, 'Insufficient stock', [`Only ${availableStock} units of ${product.title} are available.`], 400);
      }

      subtotal += unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: unitPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        variantSku: variant?.sku || '',
        isVariant: Boolean(variant),
        image: product.image
      });
      stockAdjustments.push({ productId: product._id, quantity: item.quantity, color: item.color || '', size: item.size || '', variantSku: variant?.sku || '', hasVariant: Boolean(product.variants?.length) });
    }

    let coupon = null;
    let discount = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase();
      const now = new Date();
      coupon = await Coupon.findOne({ code, isActive: true, startsAt: { $lte: now }, expiresAt: { $gt: now } });
      if (!coupon || (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit)) {
        return sendError(res, 'Coupon unavailable', ['This coupon is invalid, expired, or has reached its usage limit.'], 422);
      }
      if (subtotal < coupon.minOrderAmount) return sendError(res, 'Minimum order not met', ['The order does not meet the coupon minimum amount.'], 422);
      if (await CouponUsage.exists({ coupon: coupon._id, user: req.user._id })) return sendError(res, 'Coupon already used', ['This coupon has already been used on your account.'], 409);
      discount = getDiscount(coupon, subtotal);
    }

    const discountSubtotal = subtotal - discount;

    // 3. Shipping costs (Express is $15.00, Standard is free)
    const shippingCost = shippingMethod === 'Express' ? 15.00 : 0.00;

    // 4. Tax (Fixed 8%)
    const tax = Number((discountSubtotal * 0.08).toFixed(2));

    // 5. Total
    const total = Number((discountSubtotal + tax + shippingCost).toFixed(2));

    // 6. Generate custom order number (SN-XXXXXX)
    const orderNumber = 'SN-' + (Math.floor(Math.random() * 900000) + 100000);

    let reservedCoupon = false;
    const releaseCoupon = async () => {
      if (!coupon || !reservedCoupon) return;
      await CouponUsage.deleteOne({ coupon: coupon._id, user: req.user._id, order: null });
      await Coupon.updateOne({ _id: coupon._id, usageCount: { $gt: 0 } }, { $inc: { usageCount: -1 } });
      reservedCoupon = false;
    };
    if (coupon) {
      const usageLimitFilter = coupon.usageLimit > 0 ? { usageCount: { $lt: coupon.usageLimit } } : {};
      const claimedCoupon = await Coupon.findOneAndUpdate(
        { _id: coupon._id, isActive: true, startsAt: { $lte: new Date() }, expiresAt: { $gt: new Date() }, ...usageLimitFilter },
        { $inc: { usageCount: 1 } },
        { new: true }
      );
      if (!claimedCoupon) return sendError(res, 'Coupon unavailable', ['This coupon has reached its usage limit.'], 409);
      try {
        await CouponUsage.create({ coupon: coupon._id, user: req.user._id });
        reservedCoupon = true;
      } catch (error) {
        await Coupon.updateOne({ _id: coupon._id, usageCount: { $gt: 0 } }, { $inc: { usageCount: -1 } });
        if (error.code === 11000) return sendError(res, 'Coupon already used', ['This coupon has already been used on your account.'], 409);
        throw error;
      }
    }

    // Reserve inventory atomically before creating the order.
    const reserved = [];
    try {
      for (const adjustment of stockAdjustments) {
        const updated = await adjustStock({ ...adjustment, delta: -adjustment.quantity, reason: `Order ${orderNumber} placed`, actor: req.user._id });
        if (!updated) {
          const conflict = new Error('Inventory changed during checkout. Refresh the cart and try again.');
          conflict.inventoryConflict = true;
          throw conflict;
        }
        reserved.push(adjustment);
      }
    } catch (error) {
      for (const held of reserved.reverse()) await adjustStock({ ...held, delta: held.quantity, reason: `Order ${orderNumber} reservation rollback`, actor: req.user._id });
      await releaseCoupon();
      if (error.inventoryConflict) return sendError(res, 'Insufficient stock', [error.message], 409);
      throw error;
    }

    // Save the order only after inventory is reserved.
    let order;
    try {
      order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      subtotal,
      discount,
      coupon: coupon?._id || null,
      couponCode: coupon?.code || '',
      tax,
      shippingCost,
      total,
      shippingMethod: shippingMethod || 'Standard',
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod,
      customer
      });
    } catch (error) {
      for (const held of reserved.reverse()) await adjustStock({ ...held, delta: held.quantity, reason: `Order ${orderNumber} reservation rollback`, actor: req.user._id });
      await releaseCoupon();
      throw error;
    }
    if (coupon) await CouponUsage.updateOne({ coupon: coupon._id, user: req.user._id, order: null }, { $set: { order: order._id } });

    // Clear the persisted cart after the order has been created.
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Format response to fit expected RTK Query structure
    const frontendFormattedResponse = {
      id: order.orderNumber,
      productName: order.items[0]?.title || 'Stitch Premium Item',
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Confirmed',
      total: order.total,
      image: order.items[0]?.image || ''
    };

    return sendSuccess(res, 'Order created successfully', frontendFormattedResponse, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders
// @access  Private
export const getMyOrdersList = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

    const formattedOrders = orders.map(order => ({
      id: order.orderNumber,
      productName: order.items[0]?.title || 'Stitch Premium Item',
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      total: order.total,
      image: order.items[0]?.image || ''
    }));

    return sendSuccess(res, 'My orders retrieved', formattedOrders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('items.product').lean();
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('items.product').lean();
    }

    if (!order) {
      return sendError(res, 'Order not found', ['No order exists with this ID.'], 404);
    }

    // Users can only see their own order logs
    if (order.user.toString() !== req.user._id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      return sendError(res, 'Not Authorized', ['Cannot view another user\'s order details.'], 403);
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return sendError(res, 'Order not found', ['No order exists with this ID.'], 404);
    }

    if (order.user.toString() !== req.user._id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      return sendError(res, 'Not Authorized', ['Cannot cancel another user\'s order.'], 403);
    }

    if (order.status === 'cancelled') {
      return sendError(res, 'Order already cancelled', ['This order has already been cancelled.'], 409);
    }
    if (order.status === 'delivered' || order.status === 'shipped') {
      return sendError(res, 'Cancellation Blocked', ['Cannot cancel orders that have already shipped or been delivered.'], 400);
    }

    const previousStatus = order.status;
    order = await Order.findOneAndUpdate(
      { _id: order._id, status: previousStatus },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!order) return sendError(res, 'Order changed', ['The order changed while cancellation was being processed. Refresh and try again.'], 409);

    // Restore product and selected-variant inventory once for this cancellation.
    for (const item of order.items) {
      await adjustStock({
        productId: item.product,
        quantity: item.quantity,
        color: item.color || '',
        size: item.size || '',
        variantSku: item.variantSku || '',
        hasVariant: Boolean(item.isVariant),
        delta: item.quantity,
        reason: `Order ${order.orderNumber} cancelled`,
        actor: req.user._id,
      });
    }

    return sendSuccess(res, 'Order cancelled successfully', order);
  } catch (error) {
    next(error);
  }
};

// Admin controllers
// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user').lean();

    const formattedOrders = orders.map(order => ({
      id: order.orderNumber,
      customer: order.customer?.name || order.user?.name || 'Anonymous Client',
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      amount: order.total,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    }));

    return sendSuccess(res, 'Admin orders list retrieved', formattedOrders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return sendError(res, 'Validation Error', ['Invalid status value provided.'], 400);
    }

    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return sendError(res, 'Order not found', ['No order exists with this ID.'], 404);
    }

    if (order.status === 'cancelled' && status !== 'cancelled') {
      return sendError(res, 'Invalid order transition', ['A cancelled order cannot be reopened.'], 409);
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      const previousStatus = order.status;
      const cancelledOrder = await Order.findOneAndUpdate(
        { _id: order._id, status: previousStatus },
        { $set: { status: 'cancelled' } },
        { new: true }
      );
      if (!cancelledOrder) return sendError(res, 'Order changed', ['The order changed while cancellation was being processed. Refresh and try again.'], 409);
      for (const item of order.items) {
        await adjustStock({ productId: item.product, quantity: item.quantity, color: item.color || '', size: item.size || '', variantSku: item.variantSku || '', hasVariant: Boolean(item.isVariant), delta: item.quantity, reason: `Order ${order.orderNumber} cancelled by admin`, actor: req.user._id });
      }
      return sendSuccess(res, 'Order status updated successfully', cancelledOrder);
    }

    order.status = status;
    if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    return sendSuccess(res, 'Order status updated successfully', order);
  } catch (error) {
    next(error);
  }
};
