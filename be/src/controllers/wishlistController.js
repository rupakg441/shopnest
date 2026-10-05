import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const findProduct = (id) => objectIdPattern.test(id) ? Product.findById(id) : Product.findOne({ id });

const formatWishlist = (wishlist) => wishlist.products
  .filter((product) => product && product.status !== 'inactive')
  .map((product) => ({
    id: product.id || product._id.toString(),
    title: product.title,
    brand: product.brand,
    price: product.discountPrice != null && product.discountPrice < product.price ? product.discountPrice : product.price,
    regularPrice: product.price,
    image: product.image,
    stock: product.stock,
    category: product.category,
  }));

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    return sendSuccess(res, 'Wishlist retrieved', { items: formatWishlist(wishlist) });
  } catch (error) {
    next(error);
  }
};

export const addWishlistItem = async (req, res, next) => {
  try {
    const product = await findProduct(String(req.body.productId || ''));
    if (!product || product.status === 'inactive') return sendError(res, 'Product not found', ['This product is unavailable.'], 404);
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
    if (!wishlist.products.some((id) => id.toString() === product._id.toString())) wishlist.products.push(product._id);
    await wishlist.save();
    await wishlist.populate('products');
    return sendSuccess(res, 'Product added to wishlist', { items: formatWishlist(wishlist) });
  } catch (error) {
    next(error);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const product = await findProduct(String(req.params.productId));
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist && product) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== product._id.toString());
      await wishlist.save();
      await wishlist.populate('products');
    }
    return sendSuccess(res, 'Wishlist item removed', { items: wishlist ? formatWishlist(wishlist) : [] });
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    return sendSuccess(res, 'Wishlist cleared', { items: [] });
  } catch (error) {
    next(error);
  }
};
