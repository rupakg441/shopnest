import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorMiddleware } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import aiAgentRoutes from './src/routes/aiAgentRoutes.js';
import aiAdminRoutes from './src/routes/aiAdminRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import wishlistRoutes from './src/routes/wishlistRoutes.js';
import addressRoutes from './src/routes/addressRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';

dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL
].filter(Boolean).map(url => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Normalize requested origin
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    
    if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    console.warn(`[CORS Blocked] Origin: ${origin} (Normalized: ${normalizedOrigin}) is not in allowed origins:`, allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai/admin', aiAdminRoutes);
app.use('/api/ai', aiAgentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/content', contentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    database: 'connected'
  });
});

// Central Error Handler Middleware (placed after routes)
app.use(errorMiddleware);

export default app;
