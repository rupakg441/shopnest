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
    sku: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
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
    discountPrice: { type: Number, min: 0, default: null },
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
    images: [{ type: String, trim: true }],
    imagePublicIds: [{ type: String, trim: true }],
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
    variants: [{
      sku: { type: String, trim: true, uppercase: true },
      size: { type: String, trim: true },
      color: { type: String, trim: true },
      price: { type: Number, min: 0 },
      stock: { type: Number, min: 0, default: 0 },
    }],
    specifications: [{
      name: { type: String, required: true, trim: true, maxlength: 100 },
      value: { type: String, required: true, trim: true, maxlength: 500 },
    }],
    isFeatured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
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
productSchema.index({ status: 1, category: 1, createdAt: -1 });
productSchema.index({ status: 1, isFeatured: 1, createdAt: -1 });

productSchema.pre('validate', function () {
  if (this.discountPrice != null && this.discountPrice > this.price) {
    this.invalidate('discountPrice', 'Discount price cannot exceed regular price.');
  }
  if ((!this.images || this.images.length === 0) && this.image) this.images = [this.image];
  if (this.images?.length && !this.image) this.image = this.images[0];
});

const Product = mongoose.model('Product', productSchema);
export default Product;
