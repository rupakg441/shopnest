import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  isActive: { type: Boolean, default: true, index: true },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
