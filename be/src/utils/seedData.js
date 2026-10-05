import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Cart from '../models/Cart.js';
import { mockProducts } from '../data/mockProducts.js';

dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_SAMPLE_CUSTOMER_PASSWORD) {
      throw new Error('Set SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_SAMPLE_CUSTOMER_PASSWORD before running the seed script.');
    }
    const adminRole = process.env.SEED_ADMIN_ROLE || 'admin';
    if (!['admin', 'superadmin'].includes(adminRole)) {
      throw new Error('SEED_ADMIN_ROLE must be admin or superadmin.');
    }

    await connectDB();

    // Clear existing collections
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();

    console.log('Database cleared.');

    // Seed Admin User
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: adminRole,
      tier: 'Gold Member',
      emailVerified: true
    });

    // Seed Normal User
    const user = await User.create({
      firstName: 'Julianne',
      lastName: 'V.',
      email: 'julianne@example.com',
      password: process.env.SEED_SAMPLE_CUSTOMER_PASSWORD,
      role: 'user',
      emailVerified: true,
      tier: 'Premium Member',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjxN5e-VpzuhXSZNgICEqmhN0VtFDgnMo2wP4Zadqz6jlb3PwvIhm-BKEwH_f_-imSLdRhsIpN25FKWsMI1w7iTlDw7ytwrr4bXj9Q2k5CiqubH3nE2H7C9BYNpIQf2clyE_DJSKPfj4mlBvnNWpZtgE5-Bn8dBDK-vr20i2wv7buhe3yUdHFLvBIOot9Y2l4BicMCPIR7yiCLN1t83_dd_LN4_IGklzH6LduPk4RrjyFdUNokK_zd'
    });

    console.log('Users seeded.');

    // Map through mockProducts and save to db
    const productsToInsert = mockProducts.map(p => {
      const details = p.details || {};
      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        price: p.price,
        rating: p.rating || 0,
        reviewsCount: p.reviewsCount || 0,
        image: p.image,
        description: p.description,
        tags: p.tags || [],
        colors: p.colors || [],
        sizes: p.sizes || [],
        stock: 100, // Default stock limit
        details: {
          material: details.material || '',
          dimensions: details.dimensions || '',
          weight: details.weight || ''
        }
      };
    });

    const seededProducts = await Product.insertMany(productsToInsert);
    console.log(`${seededProducts.length} products seeded.`);

    // Calculate category counts
    const categoryCounts = {};
    seededProducts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const categoriesToInsert = Object.keys(categoryCounts).map(catName => ({
      name: catName,
      count: categoryCounts[catName]
    }));

    await Category.insertMany(categoriesToInsert);
    console.log('Categories seeded.');

    // Seed mock orders for Julianne V.
    const p12 = seededProducts.find(p => p.id === 'p12');
    const p13 = seededProducts.find(p => p.id === 'p13');

    if (p12 && p13) {
      await Order.create({
        user: user._id,
        orderNumber: 'SN-92831',
        items: [
          {
            product: p12._id,
            title: p12.title,
            price: p12.price,
            quantity: 1,
            color: 'Matte Bone',
            size: 'Large',
            image: p12.image
          }
        ],
        subtotal: p12.price,
        tax: Number((p12.price * 0.08).toFixed(2)),
        shippingCost: 0,
        total: Number((p12.price * 1.08).toFixed(2)),
        shippingMethod: 'Standard',
        status: 'shipped',
        paymentStatus: 'paid',
        customer: {
          name: user.name,
          email: user.email,
          phone: '123-456-7890',
          address: '123 Fine Living St, New York, NY 10001'
        }
      });

      await Order.create({
        user: user._id,
        orderNumber: 'SN-92745',
        items: [
          {
            product: p13._id,
            title: p13.title,
            price: p13.price,
            quantity: 2,
            color: 'Charcoal',
            size: 'Standard',
            image: p13.image
          }
        ],
        subtotal: p13.price * 2,
        tax: Number((p13.price * 2 * 0.08).toFixed(2)),
        shippingCost: 0,
        total: Number((p13.price * 2 * 1.08).toFixed(2)),
        shippingMethod: 'Standard',
        status: 'delivered',
        paymentStatus: 'paid',
        customer: {
          name: user.name,
          email: user.email,
          phone: '123-456-7890',
          address: '123 Fine Living St, New York, NY 10001'
        }
      });

      console.log('Mock orders seeded.');
    }

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data: ', error);
    process.exit(1);
  }
};

seedData();
