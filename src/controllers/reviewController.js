import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createReviewValidator } from '../validators/reviewValidator.js';

// Helper to recalculate average rating for a product
const updateProductRating = async (productObjectId) => {
  const reviews = await Review.find({ product: productObjectId });
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0 
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
    : 0;

  await Product.findByIdAndUpdate(productObjectId, {
    rating: averageRating,
    reviewsCount
  });
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let product;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ id: productId });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 'Product reviews retrieved successfully', reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const validatedData = createReviewValidator.parse(req.body);
    const { rating, comment } = validatedData;

    let product;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ id: productId });
    }

    if (!product) {
      return sendError(res, 'Product not found', ['No product exists with the specified ID.'], 404);
    }

    // 1. Verify user purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': product._id,
      status: { $ne: 'cancelled' }
    });

    if (!order) {
      return sendError(res, 'Purchase Required', ['You can only review products you have purchased.'], 403);
    }

    // 2. Prevent duplicate review for the same order and product
    const reviewExists = await Review.findOne({
      user: req.user._id,
      product: product._id,
      order: order._id
    });

    if (reviewExists) {
      return sendError(res, 'Duplicate Review', ['You have already reviewed this product for this order.'], 409);
    }

    // 3. Create review
    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      rating,
      comment,
      userName: req.user.name,
      order: order._id
    });

    // 4. Recalculate average rating
    await updateProductRating(product._id);

    return sendSuccess(res, 'Review posted successfully', review, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', ['No review exists with this ID.'], 404);
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not Authorized', ['Cannot edit another user\'s review.'], 403);
    }

    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;

    const updatedReview = await review.save();

    // Recalculate average rating
    await updateProductRating(review.product);

    return sendSuccess(res, 'Review updated successfully', updatedReview);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', ['No review exists with this ID.'], 404);
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not Authorized', ['Cannot delete another user\'s review.'], 403);
    }

    const productObjectId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    await updateProductRating(productObjectId);

    return sendSuccess(res, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};
