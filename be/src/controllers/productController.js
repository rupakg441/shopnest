import { randomBytes } from 'node:crypto';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const findProduct = (id) => objectIdPattern.test(id)
  ? Product.findById(id)
  : Product.findOne({ id });

const listProducts = async (req, res, next, includeInactive = false) => {
  try {
    const { search, category, brand, minPrice, maxPrice, rating, sort, page, limit, featured } = req.query;
    const query = includeInactive ? {} : { status: { $ne: 'inactive' } };
    if (!includeInactive) {
      const activeCategoryNames = await Category.find({ isActive: { $ne: false } }).distinct('name');
      query.category = { $in: activeCategoryNames };
    }
    const searchValue = typeof search === 'string' ? search.trim().slice(0, 80) : '';
    if (searchValue) {
      const searchRegex = new RegExp(escapeRegex(searchValue), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { brand: searchRegex }, { sku: searchRegex }];
    }
    if (typeof category === 'string' && category.trim()) {
      const selectedCategories = category.split(',').map((name) => new RegExp(`^${escapeRegex(name.trim())}$`, 'i'));
      if (query.category?.$in) query.category.$in = query.category.$in.filter((name) => selectedCategories.some((pattern) => pattern.test(name)));
      else query.category = { $in: selectedCategories };
    }
    if (typeof brand === 'string' && brand.trim()) {
      query.brand = { $in: brand.split(',').map((name) => new RegExp(`^${escapeRegex(name.trim())}$`, 'i')) };
    }

    const low = minPrice === undefined ? undefined : Number(minPrice);
    const high = maxPrice === undefined ? undefined : Number(maxPrice);
    if ((low !== undefined && (!Number.isFinite(low) || low < 0)) ||
        (high !== undefined && (!Number.isFinite(high) || high < 0)) ||
        (low !== undefined && high !== undefined && low > high)) {
      return sendError(res, 'Invalid price filter', ['Provide a valid minimum and maximum price.'], 400);
    }
    if (low !== undefined || high !== undefined) {
      query.price = {};
      if (low !== undefined) query.price.$gte = low;
      if (high !== undefined) query.price.$lte = high;
    }
    if (rating !== undefined) {
      const ratingValue = Number(rating);
      if (!Number.isFinite(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        return sendError(res, 'Invalid rating filter', ['Rating must be between 0 and 5.'], 400);
      }
      query.rating = { $gte: ratingValue };
    }
    if (featured === 'true') query.isFeatured = true;

    const sortOptions = {
      price_asc: { price: 1 },
      price_low_high: { price: 1 },
      price_desc: { price: -1 },
      price_high_low: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 },
      featured: { isFeatured: -1, createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };
    const pageNum = Math.max(1, Math.floor(Number(page) || 1));
    const limitNum = Math.min(100, Math.max(1, Math.floor(Number(limit) || 24)));
    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortBy).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    ]);

    return sendSuccess(res, 'Products retrieved successfully', {
      products,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = (req, res, next) => listProducts(req, res, next);
export const getAdminProducts = (req, res, next) => listProducts(req, res, next, true);

export const getProductFilters = async (_req, res, next) => {
  try {
    const activeCategoryNames = await Category.find({ isActive: { $ne: false } }).distinct('name');
    const catalogQuery = { status: { $ne: 'inactive' }, category: { $in: activeCategoryNames } };
    const [brands, bounds] = await Promise.all([
      Product.distinct('brand', catalogQuery),
      Product.aggregate([{ $match: catalogQuery }, { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
    ]);
    return sendSuccess(res, 'Catalog filters retrieved', {
      brands: brands.sort((a, b) => a.localeCompare(b)),
      minPrice: bounds[0]?.min || 0,
      maxPrice: bounds[0]?.max || 1200,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id).lean();
    const activeCategory = product
      ? await Category.exists({ name: product.category, isActive: { $ne: false } })
      : false;
    if (!product || product.status === 'inactive' || !activeCategory) {
      return sendError(res, 'Product not found', ['No active product exists with the specified ID.'], 404);
    }
    return sendSuccess(res, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

const validateActiveCategory = async (name) => {
  const category = await Category.findOne({ name, isActive: { $ne: false } });
  if (!category) throw Object.assign(new Error('Select an active category.'), { statusCode: 422 });
};

export const createProduct = async (req, res, next) => {
  try {
    const data = createProductValidator.parse(req.body);
    await validateActiveCategory(data.category);
    const images = data.images?.length ? data.images : data.image ? [data.image] : [];
    if (!images.length) return sendError(res, 'Validation Error', ['At least one product image is required.'], 422);

    const product = await Product.create({
      ...data,
      id: `p${randomBytes(5).toString('hex')}`,
      image: data.image || images[0],
      images,
    });
    if (product.status !== 'inactive') await Category.updateOne({ name: data.category }, { $inc: { count: 1 } });
    return sendSuccess(res, 'Product created successfully', product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const data = updateProductValidator.parse(req.body);
    const product = await findProduct(req.params.id);
    if (!product) return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);

    const oldCategory = product.category;
    const wasActive = product.status !== 'inactive';
    if (data.category) await validateActiveCategory(data.category);
    Object.assign(product, data);
    if (data.images?.length && !data.image) product.image = data.images[0];
    if (data.image && !data.images) product.images = [data.image];
    const updatedProduct = await product.save();
    const isActive = product.status !== 'inactive';
    if (oldCategory !== product.category || wasActive !== isActive) {
      await Promise.all([
        ...(wasActive ? [Category.updateOne({ name: oldCategory, count: { $gt: 0 } }, { $inc: { count: -1 } })] : []),
        ...(isActive ? [Category.updateOne({ name: product.category }, { $inc: { count: 1 } })] : []),
      ]);
    }
    return sendSuccess(res, 'Product updated successfully', updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);
    if (!product || product.status === 'inactive') {
      return sendError(res, 'Product not found', ['No active product exists with the specified ID.'], 404);
    }
    product.status = 'inactive';
    await product.save();
    await Category.updateOne({ name: product.category, count: { $gt: 0 } }, { $inc: { count: -1 } });
    return sendSuccess(res, 'Product disabled successfully');
  } catch (error) {
    next(error);
  }
};
