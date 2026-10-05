import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  content: { type: String, required: true, trim: true, maxlength: 20000 },
  isPublished: { type: Boolean, default: false, index: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

pageSchema.index({ slug: 1, isPublished: 1 });
export default mongoose.model('Page', pageSchema);
