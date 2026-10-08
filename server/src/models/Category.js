import mongoose from 'mongoose';

export const DEFAULT_CATEGORY_NAME = 'Uncategorized';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 40,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    color: {
      type: String,
      match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #4caf50'],
      default: '#9e9e9e',
    },
    // The fallback category that expenses are moved to when their category is deleted
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Case-insensitive unique names
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

/**
 * Returns the default "Uncategorized" category, creating it if it does not exist yet.
 */
categorySchema.statics.getDefault = async function getDefault() {
  return this.findOneAndUpdate(
    { isDefault: true },
    { $setOnInsert: { name: DEFAULT_CATEGORY_NAME, isDefault: true, description: 'Expenses without a category' } },
    { upsert: true, new: true }
  );
};

export default mongoose.model('Category', categorySchema);
