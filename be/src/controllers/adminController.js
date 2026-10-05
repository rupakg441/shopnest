import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import StockHistory from '../models/StockHistory.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const dayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29));
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1));
    const [totalProducts, lowStockProducts, totalUsers, totalOrders, pendingOrders, paidTotals, monthlyRows, dailyRows, topProducts, statusRows, recentOrders] = await Promise.all([
      Product.countDocuments({ status: { $ne: 'inactive' } }),
      Product.countDocuments({ status: { $ne: 'inactive' }, stock: { $gt: 0, $lte: 5 } }),
      User.countDocuments({ role: { $in: ['user', 'customer'] }, isActive: true }),
      Order.countDocuments({ status: { $nin: ['cancelled', 'refunded'] } }),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([{ $match: { paymentStatus: 'paid', status: { $nin: ['cancelled', 'refunded'] } } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $nin: ['cancelled', 'refunded'] }, createdAt: { $gte: monthStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'UTC' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $nin: ['cancelled', 'refunded'] }, createdAt: { $gte: dayStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } }, { $unwind: '$items' },
        { $group: { _id: '$items.product', title: { $first: '$items.title' }, unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { unitsSold: -1 } }, { $limit: 5 },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.find({}).sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName').lean(),
    ]);
    const totalSales = Number((paidTotals[0]?.revenue || 0).toFixed(2));
    const monthlyMap = new Map(monthlyRows.map((row) => [row._id, row]));
    const dailyMap = new Map(dailyRows.map((row) => [row._id, row.revenue]));
    const monthlySales = Array.from({ length: 12 }, (_, offset) => {
      const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11 + offset, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const row = monthlyMap.get(key);
      return { period: key, revenue: Number((row?.revenue || 0).toFixed(2)), orders: row?.orders || 0 };
    });
    const dailyRevenue = Array.from({ length: 30 }, (_, offset) => {
      const date = new Date(dayStart.getTime() + offset * 86400000);
      const key = date.toISOString().slice(0, 10);
      return { period: key, revenue: Number((dailyMap.get(key) || 0).toFixed(2)) };
    });
    const orderStatusStats = Object.fromEntries(statusRows.map((row) => [row._id, row.count]));

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customer?.name || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Anonymous Client',
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      amount: order.total,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    }));

    return sendSuccess(res, 'Dashboard statistics retrieved successfully', {
      totalSales,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      totalUsers,
      totalProducts,
      monthlySales,
      dailyRevenue,
      topProducts,
      orderStatusStats,
      recentOrders: formattedRecentOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const filter = { status: { $ne: 'inactive' } };
    const stockFilter = req.query.stock;
    if (stockFilter === 'low') filter.stock = { $gt: 0, $lte: 5 };
    if (stockFilter === 'out') filter.stock = { $lte: 0 };
    if (req.query.search) {
      const search = escapeRegex(String(req.query.search).slice(0, 80));
      filter.$or = [{ title: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
    }
    const products = await Product.find(filter).select('title sku image stock variants status').sort({ stock: 1, title: 1 }).limit(200).lean();
    const [total, lowStock, outOfStock] = await Promise.all([
      Product.countDocuments({ status: { $ne: 'inactive' } }),
      Product.countDocuments({ status: { $ne: 'inactive' }, stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ status: { $ne: 'inactive' }, stock: { $lte: 0 } }),
    ]);
    return sendSuccess(res, 'Inventory retrieved', { products, summary: { total, lowStock, outOfStock } });
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    const variantSku = typeof req.body.variantSku === 'string' ? req.body.variantSku.trim().toUpperCase() : '';
    if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100000 || reason.length < 3 || reason.length > 300) {
      return sendError(res, 'Invalid stock adjustment', ['Provide a nonzero whole-number delta and a reason of 3 to 300 characters.'], 422);
    }

    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', ['No product exists with that ID.'], 404);
    const variant = variantSku ? product.variants.find((entry) => entry.sku === variantSku) : null;
    if (variantSku && !variant) return sendError(res, 'Variant not found', ['No variant matches that SKU.'], 404);
    const stockBefore = variant ? variant.stock : product.stock;
    if (stockBefore + delta < 0) return sendError(res, 'Insufficient stock', ['Stock cannot be adjusted below zero.'], 409);

    const filter = { _id: product._id, stock: { $gte: Math.max(0, -delta) } };
    const update = { $inc: { stock: delta } };
    const options = {};
    if (variant) {
      filter.variants = { $elemMatch: { sku: variantSku, stock: { $gte: Math.max(0, -delta) } } };
      update.$inc['variants.$[target].stock'] = delta;
      options.arrayFilters = [{ 'target.sku': variantSku }];
    }
    const updated = await Product.findOneAndUpdate(filter, update, { new: true, ...options }).select('title sku stock variants');
    if (!updated) return sendError(res, 'Stock changed concurrently', ['Reload inventory and retry the adjustment.'], 409);
    const stockAfter = variant ? updated.variants.find((entry) => entry.sku === variantSku).stock : updated.stock;
    const history = await StockHistory.create({ product: updated._id, variantSku, delta, stockBefore, stockAfter, reason, actor: req.user._id });
    return sendSuccess(res, 'Inventory adjusted', { product: updated, movement: history });
  } catch (error) {
    next(error);
  }
};

export const getInventoryHistory = async (req, res, next) => {
  try {
    const history = await StockHistory.find({ product: req.params.id }).populate('actor', 'name email').sort({ createdAt: -1 }).limit(100).lean();
    return sendSuccess(res, 'Stock movement history retrieved', history);
  } catch (error) {
    next(error);
  }
};

export const exportOrdersCsv = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 })
      .select('orderNumber customer status paymentStatus paymentMethod couponCode subtotal discount tax shippingCost total createdAt').lean();
    const cell = (value) => {
      let text = String(value ?? '');
      if (/^[=+@-]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const header = ['Order number', 'Customer', 'Status', 'Payment status', 'Payment method', 'Coupon', 'Subtotal', 'Discount', 'Tax', 'Shipping', 'Total', 'Created at'];
    const rows = orders.map((order) => [
      order.orderNumber, order.customer?.name, order.status, order.paymentStatus, order.paymentMethod, order.couponCode,
      order.subtotal, order.discount, order.tax, order.shippingCost, order.total, order.createdAt?.toISOString(),
    ]);
    const csv = [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="shopnest-orders.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
