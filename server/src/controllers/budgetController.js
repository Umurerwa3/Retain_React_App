import Budget from '../models/Budget.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { monthRange } from '../utils/month.js';
import { getBudgetSummary } from '../services/budgetService.js';

// GET /api/budgets - all budgets the user has set, newest month first
export const listBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id }).sort({ month: -1 });
  res.json({ budgets });
});

// GET /api/budgets/:month - budget summary for a month (YYYY-MM)
export const getBudget = asyncHandler(async (req, res) => {
  res.json({ summary: await getBudgetSummary(req.user._id, req.params.month) });
});

// PUT /api/budgets/:month - create or update the budget for a month
export const setBudget = asyncHandler(async (req, res) => {
  const { month } = monthRange(req.params.month);
  const amount = Number(req.body.amount);
  if (req.body.amount === undefined || Number.isNaN(amount) || amount < 0) {
    throw ApiError.badRequest('Budget amount must be a number greater than or equal to 0');
  }

  await Budget.findOneAndUpdate(
    { user: req.user._id, month },
    { amount },
    { upsert: true, runValidators: true, returnDocument: 'after' }
  );
  res.json({ summary: await getBudgetSummary(req.user._id, month) });
});

// DELETE /api/budgets/:month
export const deleteBudget = asyncHandler(async (req, res) => {
  const { month } = monthRange(req.params.month);
  const result = await Budget.deleteOne({ user: req.user._id, month });
  if (!result.deletedCount) throw ApiError.notFound('No budget set for this month');
  res.json({ message: 'Budget removed' });
});
