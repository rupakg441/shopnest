import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const TAX_RATE = 0.08;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const findProduct = (id) => objectIdPattern.test(id)
  ? Product.findById(id)
  : Product.findOne({ id });

const getVariant = (product, color, size) => product.variants?.find((variant) =>
  (variant.color || '') === color && (variant.size || '') === size);

const unitPrice = (product, color, size) => {
  const variant = getVariant(product, color, size);
  return variant?.price ?? product.discountPrice ?? product.price;
};

const stockFor = (product, color, size) => getVariant(product, color, size)?.stock ?? product.stock;

const formatCart = (cart) => {
  const items = cart.items.filter((item) => item.product && item.product.status !== 'inactive').map((item) => {
    const product = item.product;
    return {
      id: product.id || product._id.toString(),
      productId: product._id.toString(),
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: unitPrice(product, item.color, item.size),
      quantity: item.quantity,
      color: item.color || '',
      size: item.size || '',
      image: product.image,
      stock: stockFor(product, item.color, item.size),
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  return { items, subtotal, tax, shippingCost: 0, total: Number((subtotal + tax).toFixed(2)) };
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const validateProductSelection = (product, quantity, color, size) => {
  if (!product || product.status === 'inactive') return { message: 'Product is unavailable.', status: 404 };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) return { message: 'Quantity must be a whole number from 1 to 1000.', status: 422 };
  const hasOptions = Boolean(product.variants?.length);
  const variant = getVariant(product, color, size);
  if (hasOptions && !variant) return { message: 'Choose an available product variant.', status: 422 };
  const stock = stockFor(product, color, size);
  if (quantity > stock) return { message: `Only ${stock} units are available.`, status: 409 };
  return null;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.product');
    return sendSuccess(res, 'Cart retrieved successfully', formatCart(cart));
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const productId = String(req.body.productId || '');
    const quantity = Number(req.body.quantity ?? 1);
    const color = typeof req.body.color === 'string' ? req.body.color : '';
    const size = typeof req.body.size === 'string' ? req.body.size : '';
    const product = await findProduct(productId);
    const validationError = validateProductSelection(product, quantity, color, size);
    if (validationError) return sendError(res, validationError.message, [validationError.message], validationError.status);

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((entry) => entry.product.toString() === product._id.toString() && (entry.color || '') === color && (entry.size || '') === size);
    if (item) {
      const combinedQuantity = item.quantity + quantity;
      const combinedError = validateProductSelection(product, combinedQuantity, color, size);
      if (combinedError) return sendError(res, combinedError.message, [combinedError.message], combinedError.status);
      item.quantity = combinedQuantity;
    } else {
      cart.items.push({ product: product._id, quantity, color, size });
    }
    await cart.save();
    await cart.populate('items.product');
    return sendSuccess(res, 'Item added to cart', formatCart(cart));
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const product = await findProduct(String(req.params.productId));
    const quantity = Number(req.body.quantity);
    const color = typeof req.body.color === 'string' ? req.body.color : '';
    const size = typeof req.body.size === 'string' ? req.body.size : '';
    const validationError = validateProductSelection(product, quantity, color, size);
    if (validationError) return sendError(res, validationError.message, [validationError.message], validationError.status);

    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.find((entry) => entry.product.toString() === product._id.toString() && (entry.color || '') === color && (entry.size || '') === size);
    if (!item) return sendError(res, 'Cart item not found', ['No item matches the selected product variant.'], 404);
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    return sendSuccess(res, 'Cart item updated', formatCart(cart));
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const product = await findProduct(String(req.params.productId));
    if (!product) return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 'Cart not found', ['No active shopping cart exists.'], 404);
    const color = typeof req.query.color === 'string' ? req.query.color : '';
    const size = typeof req.query.size === 'string' ? req.query.size : '';
    cart.items = cart.items.filter((entry) => !(entry.product.toString() === product._id.toString() && (entry.color || '') === color && (entry.size || '') === size));
    await cart.save();
    await cart.populate('items.product');
    return sendSuccess(res, 'Cart item removed', formatCart(cart));
  } catch (error) {
    next(error);
  }
};

export const clearUserCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    return sendSuccess(res, 'Cart cleared successfully', formatCart(cart));
  } catch (error) {
    next(error);
  }
};
