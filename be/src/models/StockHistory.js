import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  variantSku: { type: String, trim: true, uppercase: true, default: '' },
  delta: { type: Number, required: true },
  stockBefore: { type: Number, required: true },
  stockAfter: { type: Number, required: true },
  reason: { type: String, required: true, trim: true, maxlength: 300 },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

stockHistorySchema.index({ product: 1, createdAt: -1 });
export default mongoose.model('StockHistory', stockHistorySchema);
