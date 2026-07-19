import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).lean();
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return sendError(res, 'Category not found', ['No category exists with the specified ID.'], 404);
    }
    return sendSuccess(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return sendError(res, 'Validation Error', ['Category name is required.'], 400);
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return sendError(res, 'Category already exists', ['A category with this name already exists.'], 409);
    }

    // Count how many products are currently in this category
    const count = await Product.countDocuments({ category: name });

    const category = await Category.create({ name, count });
    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return sendError(res, 'Validation Error', ['Category name is required.'], 400);
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 'Category not found', ['No category exists with the specified ID.'], 404);
    }

    const oldName = category.name;
    category.name = name;
    
    // Recalculate count
    category.count = await Product.countDocuments({ category: name });

    const updatedCategory = await category.save();

    // Update all products with the old category name to the new name
    if (oldName !== name) {
      await Product.updateMany({ category: oldName }, { category: name });
    }

    return sendSuccess(res, 'Category updated successfully', updatedCategory);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 'Category not found', ['No category exists with the specified ID.'], 404);
    }

    await Category.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
