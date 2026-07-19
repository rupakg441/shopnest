import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      required: [true, 'Product image is required']
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    colors: [
      {
        type: String,
        trim: true
      }
    ],
    sizes: [
      {
        type: String,
        trim: true
      }
    ],
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      default: 100,
      min: [0, 'Stock cannot be negative']
    },
    details: {
      material: {
        type: String,
        trim: true
      },
      dimensions: {
        type: String,
        trim: true
      },
      weight: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Define MongoDB indexes for fast lookup and full-text search
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
