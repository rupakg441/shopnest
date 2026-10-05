import mongoose from 'mongoose';

const productEmbeddingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    productIdStr: {
      type: String,
      required: true,
      index: true,
    },
    textDocument: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      index: true,
    },
    brand: {
      type: String,
      index: true,
    },
    price: {
      type: Number,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      required: true,
      select: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

productEmbeddingSchema.index({ category: 1, brand: 1, price: 1 });

const ProductEmbedding = mongoose.models.ProductEmbedding || mongoose.model('ProductEmbedding', productEmbeddingSchema);

export default ProductEmbedding;
