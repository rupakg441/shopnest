import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      index: true
    },
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, min: 0 },
    count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

categorySchema.pre('validate', function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
});

categorySchema.index({ parent: 1, isActive: 1, sortOrder: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
