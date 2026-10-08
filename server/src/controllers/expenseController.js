import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const EDITABLE_FIELDS = ['title', 'amount', 'category', 'date', 'paymentMethod', 'notes'];

const pickEditable = (body) =>
  Object.fromEntries(EDITABLE_FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

async function assertCategoryExists(id) {
  if (id === undefined) return;
  const exists = await Category.exists({ _id: id });
  if (!exists) throw ApiError.badRequest('Selected category does not exist');
}

/**
 * Loads an expense that belongs to the current user, or throws 404.
 * Other users' expenses are reported as "not found" so their existence is not leaked.
 */
async function findOwnExpense(req) {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id }).populate('category');
  if (!expense) throw ApiError.notFound('Expense not found');
  return expense;
}

// GET /api/expenses
export const listExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).populate('category');
  res.json({ expenses });
});

// GET /api/expenses/:id
export const getExpense = asyncHandler(async (req, res) => {
  res.json({ expense: await findOwnExpense(req) });
});

// POST /api/expenses
export const createExpense = asyncHandler(async (req, res) => {
  const data = pickEditable(req.body);
  await assertCategoryExists(data.category);
  const expense = await Expense.create({ ...data, user: req.user._id });
  await expense.populate('category');
  res.status(201).json({ expense });
});

// PUT /api/expenses/:id
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await findOwnExpense(req);
  const data = pickEditable(req.body);
  await assertCategoryExists(data.category);

  expense.set(data);
  await expense.save();
  await expense.populate('category');
  res.json({ expense });
});

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await findOwnExpense(req);
  await expense.deleteOne();
  res.json({ message: 'Expense deleted', id: expense._id });
});
