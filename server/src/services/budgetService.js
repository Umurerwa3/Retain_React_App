import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { monthRange } from '../utils/month.js';
import { roundMoney } from '../utils/money.js';

// Share of the budget at which a user is "approaching" their limit
export const APPROACHING_THRESHOLD = 0.8;

export function budgetStatus(budget, spent) {
  if (!budget) return 'no_budget';
  if (spent > budget) return 'over';
  if (spent >= budget * APPROACHING_THRESHOLD) return 'approaching';
  return 'within';
}

/**
 * Builds the budget summary for one user and month:
 * the budget amount, total spent, remaining amount, percentage used and status.
 */
export async function getBudgetSummary(userId, month) {
  const range = monthRange(month);

  const [budget, totals] = await Promise.all([
    Budget.findOne({ user: userId, month: range.month }),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: null, spent: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const amount = budget?.amount ?? 0;
  const spent = roundMoney(totals[0]?.spent ?? 0);

  return {
    month: range.month,
    budget: amount,
    hasBudget: Boolean(budget),
    spent,
    remaining: budget ? roundMoney(amount - spent) : 0,
    percentUsed: amount > 0 ? Math.round((spent / amount) * 1000) / 10 : 0,
    expenseCount: totals[0]?.count ?? 0,
    status: budgetStatus(budget ? amount : 0, spent),
  };
}
