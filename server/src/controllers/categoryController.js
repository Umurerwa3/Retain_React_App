import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const pick = ({ name, description, color }) =>
  Object.fromEntries(Object.entries({ name, description, color }).filter(([, v]) => v !== undefined));

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  await Category.getDefault();
  const categories = await Category.find().sort({ isDefault: -1, name: 1 }).collation({ locale: 'en' });
  res.json({ categories });
});

// POST /api/categories (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(pick(req.body));
  res.status(201).json({ category });
});

// PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound('Category not found');
  res.json({ category });
});

// DELETE /api/categories/:id (admin)
// Expenses that used the deleted category are moved to the default "Uncategorized" category.
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (category.isDefault) throw ApiError.badRequest('The default category cannot be deleted');

  const fallback = await Category.getDefault();
  const { modifiedCount } = await Expense.updateMany(
    { category: category._id },
    { $set: { category: fallback._id } }
  );
  await category.deleteOne();

  res.json({
    message: `Category deleted. ${modifiedCount} expense(s) moved to ${fallback.name}.`,
    reassigned: modifiedCount,
  });
});
