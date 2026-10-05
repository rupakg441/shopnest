import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import { similaritySearch } from '../vector/vectorStoreService.js';

export const getPersonalizedRecommendations = async ({ userId, category, productId, limit = 6 }) => {
  try {
    // 1. If specific productId provided, get similar products using vector similarity
    if (productId && productId.match(/^[0-9a-fA-F]{24}$/)) {
      const targetProduct = await Product.findById(productId);
      if (targetProduct) {
        const queryText = `${targetProduct.title} ${targetProduct.category} ${targetProduct.brand} ${targetProduct.description}`;
        const vectorMatches = await similaritySearch({
          queryText,
          filter: { category: targetProduct.category },
          limit: limit + 1,
        });

        const filtered = vectorMatches
          .map((m) => m.product)
          .filter((p) => p && p._id.toString() !== productId)
          .slice(0, limit);

        if (filtered.length >= 2) {
          return filtered;
        }
      }
    }

    // 2. If user is logged in, inspect user's past purchase categories
    if (userId) {
      const recentOrders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
      const purchasedCategories = new Set();
      recentOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.category) purchasedCategories.add(item.category);
        });
      });

      if (purchasedCategories.size > 0) {
        const userRecs = await Product.find({
          category: { $in: Array.from(purchasedCategories) },
        })
          .sort({ rating: -1 })
          .limit(limit);

        if (userRecs.length >= 2) return userRecs;
      }
    }

    // 3. Fallback to category / rating popular products
    const filter = category ? { category } : {};
    return await Product.find(filter).sort({ rating: -1, reviewsCount: -1 }).limit(limit);
  } catch (err) {
    console.error('[RecommendationService] Error fetching recommendations:', err.message);
    return await Product.find({}).sort({ rating: -1 }).limit(limit);
  }
};
