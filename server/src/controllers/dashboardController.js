import Expense from '../models/Expense.js';
import asyncHandler from '../utils/asyncHandler.js';
import { monthRange } from '../utils/month.js';
import { getBudgetSummary } from '../services/budgetService.js';
import { roundMoney } from '../utils/money.js';

// GET /api/dashboard?month=YYYY-MM
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { month, start, end } = monthRange(req.query.month);
  const inMonth = { user: userId, date: { $gte: start, $lt: end } };

  const [budget, highestExpense, byCategory, daily, recentExpenses] = await Promise.all([
    getBudgetSummary(userId, month),
    Expense.findOne(inMonth).sort({ amount: -1, date: -1 }).populate('category'),
    Expense.aggregate([
      { $match: inMonth },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: { $ifNull: ['$category.name', 'Unknown'] },
          color: { $ifNull: ['$category.color', '#9e9e9e'] },
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: inMonth },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $project: { _id: 0, date: '$_id', total: 1 } },
      { $sort: { date: 1 } },
    ]),
    Expense.find({ user: userId }).sort({ date: -1, createdAt: -1 }).limit(5).populate('category'),
  ]);

  res.json({
    month,
    totalSpent: budget.spent,
    expenseCount: budget.expenseCount,
    budget,
    highestExpense,
    spendingByCategory: byCategory.map((c) => ({ ...c, total: roundMoney(c.total) })),
    dailySpending: daily.map((d) => ({ ...d, total: roundMoney(d.total) })),
    recentExpenses,
  });
});
