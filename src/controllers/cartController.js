import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const TAX_RATE = 0.08;

const calculateCartTotals = (items) => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return { subtotal, tax, total };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const { subtotal, tax, total } = calculateCartTotals(cart.items);

    const formattedItems = cart.items.map(item => ({
      id: item.product.id || item.product._id.toString(),
      title: item.product.title,
      brand: item.product.brand,
      category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      image: item.product.image
    }));

    return sendSuccess(res, 'Cart retrieved successfully', {
      items: formattedItems,
      subtotal,
      tax,
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, color, size } = req.body;
    const qty = Number(quantity) || 1;

    // Resolve product in MongoDB
    let product;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ id: productId });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    // Validate inventory stock
    if (product.stock < qty) {
      return sendError(res, 'Insufficient stock', [`Only ${product.stock} units available in inventory.`], 400);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart with same color and size
    const existingItemIdx = cart.items.findIndex(item => 
      item.product.toString() === product._id.toString() &&
      item.color === color &&
      item.size === size
    );

    if (existingItemIdx > -1) {
      const newQty = cart.items[existingItemIdx].quantity + qty;
      if (product.stock < newQty) {
        return sendError(res, 'Insufficient stock', [`Adding ${qty} units would exceed available stock of ${product.stock}.`], 400);
      }
      cart.items[existingItemIdx].quantity = newQty;
    } else {
      cart.items.push({
        product: product._id,
        quantity: qty,
        color,
        size
      });
    }

    await cart.save();
    
    // Fetch populated cart for calculating totals
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    const { subtotal, tax, total } = calculateCartTotals(populatedCart.items);

    return sendSuccess(res, 'Item added to cart', {
      subtotal,
      tax,
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, color, size } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || qty <= 0) {
      return sendError(res, 'Validation Error', ['Quantity must be a positive number.'], 400);
    }

    let product;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ id: productId });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    // Validate inventory stock
    if (product.stock < qty) {
      return sendError(res, 'Insufficient stock', [`Only ${product.stock} units available in inventory.`], 400);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, 'Cart not found', ['No active shopping cart found for user.'], 404);
    }

    // Find the item matching productId, color, size
    const item = cart.items.find(item => 
      item.product.toString() === product._id.toString() &&
      item.color === color &&
      item.size === size
    );

    if (!item) {
      return sendError(res, 'Item not found in cart', ['No item matches color and size specifications.'], 404);
    }

    item.quantity = qty;
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    const { subtotal, tax, total } = calculateCartTotals(populatedCart.items);

    return sendSuccess(res, 'Cart item updated', { subtotal, tax, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { color, size } = req.query; // Send specifications in query parameters

    let product;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ id: productId });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, 'Cart not found', ['No active shopping cart found for user.'], 404);
    }

    cart.items = cart.items.filter(item => !(
      item.product.toString() === product._id.toString() &&
      item.color === color &&
      item.size === size
    ));

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    const { subtotal, tax, total } = calculateCartTotals(populatedCart.items);

    return sendSuccess(res, 'Cart item removed', { subtotal, tax, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearUserCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return sendSuccess(res, 'Cart cleared successfully', { subtotal: 0, tax: 0, total: 0 });
  } catch (error) {
    next(error);
  }
};
