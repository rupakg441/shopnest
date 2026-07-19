import User from '../models/User.js';
import Order from '../models/Order.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { updateProfileValidator, updatePasswordValidator } from '../validators/userValidator.js';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 'Profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileValidator.parse(req.body);
    const user = await User.findById(req.user._id);

    if (validatedData.firstName) user.firstName = validatedData.firstName;
    if (validatedData.lastName) user.lastName = validatedData.lastName;
    
    if (validatedData.email && validatedData.email !== user.email) {
      const emailExists = await User.findOne({ email: validatedData.email });
      if (emailExists) {
        return sendError(res, 'Email already in use', ['The requested email address is already registered.'], 409);
      }
      user.email = validatedData.email;
    }

    const updatedUser = await user.save();
    return sendSuccess(res, 'Profile updated successfully', {
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        tier: updatedUser.tier,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/me/password
// @access  Private
export const updateUserPassword = async (req, res, next) => {
  try {
    const validatedData = updatePasswordValidator.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Invalid password', ['The current password entered is incorrect.'], 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user orders
// @route   GET /api/users/me/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    // Order model will be created in Phase 6, but we import it here dynamically or standard import is fine (Node will resolve it when endpoints are hit)
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    
    // Shape order response for frontend format
    const formattedOrders = orders.map(order => ({
      id: order.orderNumber || `SN-${order._id.toString().slice(-6).toUpperCase()}`,
      productName: order.items[0]?.title || 'Stitch Premium Item',
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize
      total: order.total,
      image: order.items[0]?.image || ''
    }));

    return sendSuccess(res, 'User orders retrieved', formattedOrders);
  } catch (error) {
    next(error);
  }
};

// Admin controllers
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    return sendSuccess(res, 'All users retrieved', { users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', ['No user exists with the specified ID.'], 404);
    }
    return sendSuccess(res, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user by ID (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', ['No user exists with the specified ID.'], 404);
    }

    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.tier) user.tier = req.body.tier;

    const updatedUser = await user.save();
    return sendSuccess(res, 'User updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', ['No user exists with the specified ID.'], 404);
    }

    await User.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};
