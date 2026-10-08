import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { monthRange } from '../utils/month.js';
import { roundMoney } from '../utils/money.js';

const RECENT_LIMIT = 5;

// GET /api/admin/insights
export const getInsights = asyncHandler(async (req, res) => {
  const { start, end } = monthRange();

  const [totalUsers, totalExpenses, totals, expensesThisMonth, categories, usage, recentExpenses, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Expense.countDocuments({ date: { $gte: start, $lt: end } }),
      Category.find().lean(),
      Expense.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Expense.find()
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .populate('category')
        .populate('user', 'name email'),
      User.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT),
    ]);

  // Every category is included, so unused ones show up with zero usage
  const usageById = new Map(usage.map((u) => [String(u._id), u]));
  const categoryStats = categories.map((c) => ({
    categoryId: c._id,
    name: c.name,
    color: c.color,
    total: roundMoney(usageById.get(String(c._id))?.total ?? 0),
    count: usageById.get(String(c._id))?.count ?? 0,
  }));

  const byUsage = [...categoryStats].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  res.json({
    totalUsers,
    totalExpenses,
    totalValue: roundMoney(totals[0]?.sum ?? 0),
    expensesThisMonth,
    spendingPerCategory: [...categoryStats].sort((a, b) => b.total - a.total),
    topCategories: byUsage.slice(0, 5),
    bottomCategories: [...byUsage].reverse().slice(0, 5),
    recentExpenses,
    recentUsers,
  });
});
