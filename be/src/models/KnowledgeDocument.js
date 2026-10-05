import mongoose from 'mongoose';

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['faq', 'return_policy', 'shipping_policy', 'refund_policy', 'warranty', 'company_info', 'product_docs', 'general'],
      default: 'general',
    },
    content: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      default: [],
      select: false, // Don't return heavy vector array in normal queries
    },
    metadata: {
      type: Object,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeDocumentSchema.index({ category: 1, isActive: 1 });
knowledgeDocumentSchema.index({ title: 'text', content: 'text' });

const KnowledgeDocument = mongoose.models.KnowledgeDocument || mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);

export default KnowledgeDocument;
