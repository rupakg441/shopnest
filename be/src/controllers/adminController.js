import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Aggregate completed orders
    const orders = await Order.find({ status: { $ne: 'cancelled' } }).lean();
    const totalOrders = orders.length;
    
    const totalSales = Number(orders.reduce((acc, o) => acc + o.total, 0).toFixed(2));

    // Get 5 most recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user')
      .lean();

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customer?.name || order.user?.name || 'Anonymous Client',
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      amount: order.total,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    }));

    return sendSuccess(res, 'Dashboard statistics retrieved successfully', {
      totalSales,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders: formattedRecentOrders
    });
  } catch (error) {
    next(error);
  }
};
