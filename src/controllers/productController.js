import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';

// @desc    Get all products (with search, filtering, sorting, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, minPrice, maxPrice, rating, sort, page, limit } = req.query;

    const query = {};

    // Search query using regex or text index
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filtering
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Brand filtering
    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filtering
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting
    let sortBy = { createdAt: -1 }; // Default newest
    if (sort) {
      if (sort === 'price_asc' || sort === 'price_low_high') {
        sortBy = { price: 1 };
      } else if (sort === 'price_desc' || sort === 'price_high_low') {
        sortBy = { price: -1 };
      } else if (sort === 'rating') {
        sortBy = { rating: -1 };
      } else if (sort === 'newest') {
        sortBy = { createdAt: -1 };
      }
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 1000; // Large limit to return all seeded data for client-side filtering unless specified
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, 'Products retrieved successfully', {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID (supports Mongoose ObjectIds and Custom string IDs like "p1")
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).lean();
    } else {
      product = await Product.findOne({ id }).lean();
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    return sendSuccess(res, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const validatedData = createProductValidator.parse(req.body);

    // Auto-generate custom short string ID e.g., p28
    const count = await Product.countDocuments();
    const customId = `p${count + 1}`;

    const product = await Product.create({
      id: customId,
      ...validatedData
    });

    return sendSuccess(res, 'Product created successfully', product, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductValidator.parse(req.body);

    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ id });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    Object.assign(product, validatedData);
    const updatedProduct = await product.save();

    return sendSuccess(res, 'Product updated successfully', updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndDelete(id);
    } else {
      product = await Product.findOneAndDelete({ id });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    return sendSuccess(res, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};
