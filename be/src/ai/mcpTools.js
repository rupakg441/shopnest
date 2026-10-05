import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ignoredSearchTerms = new Set([
  'a', 'an', 'and', 'are', 'buy', 'find', 'for', 'from', 'i', 'in', 'me', 'of',
  'category', 'please', 'product', 'products', 'show', 'some', 'the', 'to', 'want', 'with',
]);

export const searchProducts = async (query) => {
  const searchTerms = [...new Set(
    (query.trim().slice(0, 80).toLowerCase().match(/[a-z0-9]+/g) || [])
      .filter((term) => !ignoredSearchTerms.has(term))
  )];
  if (!searchTerms.length) return [];

  const activeCategoryNames = await Category.find({ isActive: { $ne: false } }).distinct('name');
  if (!activeCategoryNames.length) return [];

  const products = await Product.find({
    status: { $ne: 'inactive' },
    category: { $in: activeCategoryNames },
    $or: [
      ...searchTerms.flatMap((term) => {
        const safeTerm = escapeRegex(term);
        return [
          { title: { $regex: safeTerm, $options: 'i' } },
          { description: { $regex: safeTerm, $options: 'i' } },
          { category: { $regex: safeTerm, $options: 'i' } },
          { brand: { $regex: safeTerm, $options: 'i' } },
          { tags: { $regex: safeTerm, $options: 'i' } },
        ];
      }),
    ]
  }).sort({ isFeatured: -1, rating: -1, createdAt: -1 }).limit(5).lean();

  return products.map(({ _id, id, title, price, discountPrice, image, category, rating, stock, description }) => ({
    id: id || _id.toString(),
    title,
    price,
    discountPrice,
    image,
    category,
    rating,
    stock,
    description
  }));
};

export const getUserOrders = async (userId) => {
  return Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber status total createdAt items')
    .lean();
};

export const createShopNestMcpServer = ({ authenticatedUserId } = {}) => {
  const userId = String(authenticatedUserId || '');
  if (!/^[0-9a-f]{24}$/i.test(userId)) {
    throw new Error('An authenticated customer context is required for order tools.');
  }

  const server = new McpServer({ name: 'shopnest-commerce', version: '1.0.0' });

  server.registerTool(
    'search_products',
    {
      description: 'Search the ShopNest catalog by title, category, brand, or description.',
      inputSchema: { query: z.string().min(1).max(80) }
    },
    async ({ query }) => ({ content: [{ type: 'text', text: JSON.stringify(await searchProducts(query)) }] })
  );

  server.registerTool(
    'get_my_orders',
    {
      description: 'List the authenticated customer\'s recent orders.',
      inputSchema: {}
    },
    async () => ({ content: [{ type: 'text', text: JSON.stringify(await getUserOrders(userId)) }] })
  );

  return server;
};
