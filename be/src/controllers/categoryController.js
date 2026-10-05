import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createCategoryValidator, updateCategoryValidator } from '../validators/categoryValidator.js';

const toSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await Category.find({ isActive: { $ne: false } })
      .sort({ sortOrder: 1, name: 1 }).populate('parent', 'name slug').lean();
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (_req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).populate('parent', 'name slug').lean();
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isActive: { $ne: false } })
      .populate('parent', 'name slug').lean();
    if (!category) return sendError(res, 'Category not found', ['No category exists with the specified ID.'], 404);
    return sendSuccess(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

const validateParent = async (parentId, categoryId = null) => {
  if (!parentId) return null;
  let parent = await Category.findById(parentId);
  if (!parent || parent.isActive === false) throw Object.assign(new Error('Parent category not found.'), { statusCode: 422 });
  const visited = new Set();
  while (parent) {
    const currentId = parent._id.toString();
    if (currentId === categoryId || visited.has(currentId)) {
      throw Object.assign(new Error('Category hierarchy cannot contain a cycle.'), { statusCode: 422 });
    }
    visited.add(currentId);
    parent = parent.parent ? await Category.findById(parent.parent).select('_id parent') : null;
  }
  return parentId;
};

export const createCategory = async (req, res, next) => {
  try {
    const input = createCategoryValidator.parse(req.body);
    const slug = toSlug(input.name);
    if (await Category.exists({ slug })) {
      return sendError(res, 'Category already exists', ['A category with this name already exists.'], 409);
    }
    const parent = await validateParent(input.parent);
    const count = await Product.countDocuments({ category: input.name });
    const category = await Category.create({ ...input, slug, parent, count });
    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const input = updateCategoryValidator.parse(req.body);
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 'Category not found', ['No category exists with the specified ID.'], 404);
    if (input.isActive === false && category.isActive !== false) {
      const childCount = await Category.countDocuments({ parent: category._id, isActive: { $ne: false } });
      if (childCount) {
        return sendError(res, 'Category has active children', ['Disable or move its child categories before disabling it.'], 409);
      }
    }

    const oldName = category.name;
    if (input.name && input.name !== oldName) {
      const slug = toSlug(input.name);
      if (await Category.exists({ slug, _id: { $ne: category._id } })) {
        return sendError(res, 'Category already exists', ['A category with this name already exists.'], 409);
      }
      category.slug = slug;
      category.name = input.name;
    }
    if (Object.hasOwn(input, 'parent')) category.parent = await validateParent(input.parent, category._id.toString());
    for (const field of ['description', 'image', 'imagePublicId', 'isActive', 'sortOrder']) {
      if (Object.hasOwn(input, field)) category[field] = input[field];
    }

    const updatedCategory = await category.save();
    if (oldName !== category.name) {
      await Product.updateMany({ category: oldName }, { $set: { category: category.name } });
      category.count = await Product.countDocuments({ category: category.name });
      await category.save();
    }
    return sendSuccess(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 'Category not found', ['No category exists with the specified ID.'], 404);
    const childCount = await Category.countDocuments({ parent: category._id, isActive: { $ne: false } });
    if (childCount) {
      return sendError(res, 'Category has active children', ['Disable or move its child categories before disabling it.'], 409);
    }
    category.isActive = false;
    await category.save();
    return sendSuccess(res, 'Category disabled successfully');
  } catch (error) {
    next(error);
  }
};
