import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createOrderValidator } from '../validators/orderValidator.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const validatedData = createOrderValidator.parse(req.body);
    const { items, customer, shippingMethod } = validatedData;

    let subtotal = 0;
    const orderItems = [];

    // 1. Fetch current products & verify stock and prices in MongoDB
    for (const item of items) {
      let product;
      if (item.id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(item.id);
      } else {
        product = await Product.findOne({ id: item.id });
      }

      if (!product) {
        return sendError(res, 'Product not found', [`Product with ID ${item.id} does not exist.`], 404);
      }

      if (product.stock < item.quantity) {
        return sendError(res, 'Insufficient stock', [`Only ${product.stock} units of ${product.title} are available.`], 400);
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: product.image
      });
    }

    // 2. Apply promo discount (WELCOME10 offers 10% off subtotal)
    let discount = 0;
    const promoCode = req.body.promoCode || '';
    if (promoCode.trim().toUpperCase() === 'WELCOME10' || req.body.promoApplied === true) {
      discount = Number((subtotal * 0.1).toFixed(2));
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

    // 7. Save order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      subtotal,
      discount,
      tax,
      shippingCost,
      total,
      shippingMethod: shippingMethod || 'Standard',
      status: 'confirmed',
      paymentStatus: 'paid',
      customer
    });

    // 8. Deduct stock from products
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 9. Clear cart
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
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not Authorized', ['Cannot cancel another user\'s order.'], 403);
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      return sendError(res, 'Cancellation Blocked', ['Cannot cancel orders that have already shipped or been delivered.'], 400);
    }

    order.status = 'cancelled';
    await order.save();

    // Replenish product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
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

    order.status = status;
    await order.save();

    return sendSuccess(res, 'Order status updated successfully', order);
  } catch (error) {
    next(error);
  }
};
