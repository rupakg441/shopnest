import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, trim: true, maxlength: 60, default: 'Home' },
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  line1: { type: String, required: true, trim: true, maxlength: 200 },
  line2: { type: String, trim: true, maxlength: 200, default: '' },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, trim: true, maxlength: 100, default: '' },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['shipping', 'billing', 'both'], default: 'shipping' },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

addressSchema.index({ user: 1, isDefault: -1, updatedAt: -1 });
addressSchema.index({ user: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

export default mongoose.model('Address', addressSchema);
