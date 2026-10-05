import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import Cart from '../../models/Cart.js';
import { hybridSearch } from '../vector/vectorStoreService.js';
import { queryKnowledgeBase } from '../rag/ragService.js';
import { getPersonalizedRecommendations } from '../services/recommendationService.js';

export const createEcommerceTools = (userContext = {}) => {
  const userId = userContext._id ? userContext._id.toString() : null;

  const searchProductsTool = new DynamicStructuredTool({
    name: 'searchProducts',
    description: 'Search catalog products by keyword, category, brand, or price constraints.',
    schema: z.object({
      query: z.string().optional().describe('Keywords or search text'),
      category: z.string().optional().describe('Product category'),
      brand: z.string().optional().describe('Brand name'),
      minPrice: z.number().optional().describe('Minimum price'),
      maxPrice: z.number().optional().describe('Maximum price'),
      limit: z.number().optional().default(6).describe('Number of products to return'),
    }),
    func: async ({ query, category, brand, minPrice, maxPrice, limit }) => {
      const filter = {};
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ];
      }

      const products = await Product.find(filter).limit(limit);
      return JSON.stringify(
        (products || []).map((p) => ({
          id: p._id || p.id,
          title: p.title || p.name,
          brand: p.brand || 'Generic',
          category: p.category || 'General',
          price: p.price || 0,
          stock: p.stock ?? 100,
          rating: p.rating || 0,
          image: p.image || '',
        }))
      );
    },
  });

  const searchSemanticProductsTool = new DynamicStructuredTool({
    name: 'searchSemanticProducts',
    description: 'Find products using natural language intent and vector similarity search.',
    schema: z.object({
      naturalLanguageQuery: z.string().describe('User request description (e.g., laptop for React dev)'),
      category: z.string().optional(),
      maxPrice: z.number().optional(),
      limit: z.number().optional().default(6),
    }),
    func: async ({ naturalLanguageQuery, category, maxPrice, limit }) => {
      const results = await hybridSearch({
        queryText: naturalLanguageQuery,
        filter: { category, maxPrice },
        limit,
      });
      return JSON.stringify(
        (results || [])
          .filter((r) => r && r.product)
          .map((r) => ({
            id: r.product._id || r.product.id,
            title: r.product.title || r.product.name,
            brand: r.product.brand || 'Generic',
            category: r.product.category || 'General',
            price: r.product.price || 0,
            stock: r.product.stock ?? 100,
            rating: r.product.rating || 0,
            image: r.product.image || '',
            matchScore: r.score || 0.5,
          }))
      );
    },
  });

  const getProductDetailsTool = new DynamicStructuredTool({
    name: 'getProductDetails',
    description: 'Retrieve detailed information, specs, colors, sizes, and description for a product by ID or title.',
    schema: z.object({
      identifier: z.string().describe('Product ID or product title'),
    }),
    func: async ({ identifier }) => {
      let product = null;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(identifier);
      }
      if (!product) {
        product = await Product.findOne({ title: { $regex: identifier, $options: 'i' } });
      }
      if (!product) return 'Product not found.';
      return JSON.stringify(product);
    },
  });

  const compareProductsTool = new DynamicStructuredTool({
    name: 'compareProducts',
    description: 'Compare two or more products side-by-side by their IDs or titles.',
    schema: z.object({
      identifiers: z.array(z.string()).describe('Array of 2 to 4 product IDs or titles'),
    }),
    func: async ({ identifiers }) => {
      const products = [];
      for (const id of identifiers) {
        let p = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          p = await Product.findById(id);
        } else {
          p = await Product.findOne({ title: { $regex: id, $options: 'i' } });
        }
        if (p) products.push(p);
      }
      if (!products.length) return 'No matching products found to compare.';
      return JSON.stringify(
        products.map((p) => ({
          id: p._id || p.id,
          title: p.title || p.name,
          brand: p.brand || 'Generic',
          category: p.category || 'General',
          price: p.price || 0,
          rating: p.rating || 0,
          stock: p.stock ?? 100,
          details: p.details || {},
        }))
      );
    },
  });

  const checkInventoryTool = new DynamicStructuredTool({
    name: 'checkInventory',
    description: 'Check exact stock availability for a product by ID or title.',
    schema: z.object({
      identifier: z.string().describe('Product ID or title'),
    }),
    func: async ({ identifier }) => {
      let product = null;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(identifier);
      } else {
        product = await Product.findOne({ title: { $regex: identifier, $options: 'i' } });
      }
      if (!product) return 'Product not found.';
      return JSON.stringify({
        productId: product._id || product.id,
        title: product.title,
        stock: product.stock,
        inStock: product.stock > 0,
      });
    },
  });

  const getUserOrdersTool = new DynamicStructuredTool({
    name: 'getUserOrders',
    description: 'Retrieve order history for the currently logged-in user.',
    schema: z.object({
      limit: z.number().optional().default(5),
    }),
    func: async ({ limit }) => {
      if (!userId) return 'User is not logged in. Cannot retrieve private user orders.';
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
      if (!orders.length) return 'No orders found for this user.';
      return JSON.stringify(
        orders.map((o) => ({
          orderId: o._id || o.id,
          orderNumber: o.orderNumber,
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
          itemCount: (o.items || []).length,
          items: (o.items || []).map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
        }))
      );
    },
  });

  const getOrderStatusTool = new DynamicStructuredTool({
    name: 'getOrderStatus',
    description: 'Get status and tracking details for a specific order by order number or order ID.',
    schema: z.object({
      orderIdentifier: z.string().describe('Order Number (e.g., SN-92831) or Mongo Order ID'),
    }),
    func: async ({ orderIdentifier }) => {
      if (!userId) return 'User is not logged in.';
      let order = await Order.findOne({
        user: userId,
        $or: [{ orderNumber: orderIdentifier }, { _id: orderIdentifier.match(/^[0-9a-fA-F]{24}$/) ? orderIdentifier : null }],
      });
      if (!order) return 'Order not found for this user.';
      return JSON.stringify({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingMethod: order.shippingMethod,
        total: order.total,
        customerAddress: order.customer?.address || '',
        createdAt: order.createdAt,
      });
    },
  });

  const cancelOrderTool = new DynamicStructuredTool({
    name: 'cancelOrder',
    description: 'Cancel an order for the logged-in user. Requires user confirmation first.',
    schema: z.object({
      orderIdentifier: z.string().describe('Order number or ID to cancel'),
      confirmed: z.boolean().optional().default(false).describe('Must be set to true after explicit user confirmation'),
    }),
    func: async ({ orderIdentifier, confirmed }) => {
      if (!userId) return 'Authentication required to cancel orders.';
      if (!confirmed) {
        return JSON.stringify({
          requiresConfirmation: true,
          action: 'cancelOrder',
          orderIdentifier,
          message: `Are you sure you want to cancel order ${orderIdentifier}? Please confirm to proceed.`,
        });
      }

      let order = await Order.findOne({
        user: userId,
        $or: [{ orderNumber: orderIdentifier }, { _id: orderIdentifier.match(/^[0-9a-fA-F]{24}$/) ? orderIdentifier : null }],
      });
      if (!order) return 'Order not found or unauthorized.';

      if (['delivered', 'cancelled'].includes(order.status)) {
        return `Order ${order.orderNumber} cannot be cancelled because it is already ${order.status}.`;
      }

      order.status = 'cancelled';
      await order.save();
      return JSON.stringify({ success: true, message: `Order ${order.orderNumber} has been successfully cancelled.` });
    },
  });

  const addToCartTool = new DynamicStructuredTool({
    name: 'addToCart',
    description: 'Add a product to the logged-in user active cart.',
    schema: z.object({
      productId: z.string().describe('MongoDB Product ID'),
      quantity: z.number().optional().default(1),
      color: z.string().optional(),
      size: z.string().optional(),
    }),
    func: async ({ productId, quantity, color, size }) => {
      if (!userId) return 'Please log in to add items to your shopping cart.';
      const product = await Product.findById(productId);
      if (!product) return 'Product not found.';
      if (product.stock < quantity) return `Only ${product.stock} items available in stock.`;

      let cart = await Cart.findOne({ user: userId });
      if (!cart) cart = await Cart.create({ user: userId, items: [] });

      const itemIdx = cart.items.findIndex((i) => i.product.toString() === productId && i.color === (color || '') && i.size === (size || ''));
      if (itemIdx > -1) {
        cart.items[itemIdx].quantity += quantity;
      } else {
        cart.items.push({
          product: product._id,
          title: product.title,
          price: product.price,
          quantity,
          color: color || '',
          size: size || '',
          image: product.image,
        });
      }
      await cart.save();
      return JSON.stringify({ success: true, message: `Added ${product.title} to your cart.`, cartItemCount: cart.items.length });
    },
  });

  const getReturnPolicyTool = new DynamicStructuredTool({
    name: 'getReturnPolicy',
    description: 'Retrieve official ShopNest return and refund policies.',
    schema: z.object({
      query: z.string().optional().default('return policy refund conditions'),
    }),
    func: async ({ query }) => {
      const res = await queryKnowledgeBase(query, { category: 'return_policy' });
      return res.contextText || 'ShopNest allows returns within 30 days of delivery for unused items in original packaging.';
    },
  });

  const getShippingPolicyTool = new DynamicStructuredTool({
    name: 'getShippingPolicy',
    description: 'Retrieve official ShopNest shipping speeds, costs, and policies.',
    schema: z.object({
      query: z.string().optional().default('shipping options costs delivery time'),
    }),
    func: async ({ query }) => {
      const res = await queryKnowledgeBase(query, { category: 'shipping_policy' });
      return res.contextText || 'Standard shipping takes 3-5 business days and is free over $50.';
    },
  });

  const searchKnowledgeBaseTool = new DynamicStructuredTool({
    name: 'searchKnowledgeBase',
    description: 'Search company documentation, FAQs, and store policies.',
    schema: z.object({
      question: z.string().describe('User question or topic'),
    }),
    func: async ({ question }) => {
      const res = await queryKnowledgeBase(question);
      return res.contextText || 'No specific documentation found for this question.';
    },
  });

  const recommendProductsTool = new DynamicStructuredTool({
    name: 'recommendProducts',
    description: 'Get AI product recommendations based on catalog embeddings and user history.',
    schema: z.object({
      category: z.string().optional(),
      productId: z.string().optional(),
      limit: z.number().optional().default(4),
    }),
    func: async ({ category, productId, limit }) => {
      const recs = await getPersonalizedRecommendations({ userId, category, productId, limit });
      return JSON.stringify(
        (recs || []).map((p) => ({
          id: p._id || p.id,
          title: p.title || p.name,
          brand: p.brand || 'Generic',
          category: p.category || 'General',
          price: p.price || 0,
          rating: p.rating || 0,
          image: p.image || '',
        }))
      );
    },
  });

  return [
    searchProductsTool,
    searchSemanticProductsTool,
    getProductDetailsTool,
    compareProductsTool,
    checkInventoryTool,
    getUserOrdersTool,
    getOrderStatusTool,
    cancelOrderTool,
    addToCartTool,
    getReturnPolicyTool,
    getShippingPolicyTool,
    searchKnowledgeBaseTool,
    recommendProductsTool,
  ];
};
