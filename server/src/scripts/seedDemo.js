/**
 * Fills the database with demo data for presentations:
 * - a demo user with ~3 months of expenses and budgets
 *   (two months ago: within budget, last month: over budget, this month: approaching),
 * - a few extra users with lighter activity so admin insights have something to show.
 *
 * Re-running it deletes and recreates the demo users and their data only.
 *
 *   npm run seed:demo
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedData } from '../services/seedService.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234';

const DEMO_USER = { name: 'Demo User', email: 'demo@retain.app' };
const EXTRA_USERS = [
  { name: 'Aline Uwase', email: 'aline@demo.retain.app' },
  { name: 'Kevin Mugisha', email: 'kevin@demo.retain.app' },
  { name: 'Grace Iradukunda', email: 'grace@demo.retain.app' },
  { name: 'Eric Habimana', email: 'eric@demo.retain.app' },
];

// [title, min, max, payment methods, optional notes] per category
const TEMPLATES = {
  'Food & Dining': [
    ['Groceries at Simba', 25, 80, ['debit_card', 'mobile_money'], 'Weekly shop'],
    ['Lunch with friends', 8, 25, ['cash', 'mobile_money']],
    ['Coffee', 3, 6, ['cash', 'mobile_money']],
    ['Pizza night', 15, 35, ['credit_card']],
  ],
  Transport: [
    ['Moto to campus', 1, 3, ['cash', 'mobile_money']],
    ['Bus card top-up', 5, 15, ['mobile_money']],
    ['Fuel', 20, 50, ['debit_card', 'cash']],
    ['Taxi to airport', 15, 30, ['mobile_money', 'credit_card'], 'Weekend trip'],
  ],
  Housing: [['Rent', 250, 250, ['bank_transfer'], 'Monthly rent']],
  Utilities: [
    ['Electricity tokens', 10, 25, ['mobile_money']],
    ['Internet bill', 30, 30, ['bank_transfer']],
    ['Phone airtime', 5, 10, ['mobile_money']],
  ],
  Entertainment: [
    ['Netflix subscription', 10, 10, ['credit_card']],
    ['Cinema tickets', 8, 20, ['mobile_money', 'cash']],
    ['Concert ticket', 30, 70, ['credit_card'], 'Kigali Jazz Fusion'],
  ],
  Health: [
    ['Pharmacy', 5, 30, ['cash', 'mobile_money']],
    ['Gym membership', 25, 25, ['debit_card']],
  ],
  Shopping: [
    ['New shoes', 30, 70, ['credit_card', 'debit_card']],
    ['Phone case', 8, 15, ['mobile_money']],
    ['Clothes', 20, 60, ['credit_card']],
  ],
  Education: [
    ['Textbook', 15, 45, ['debit_card']],
    ['Online course', 10, 30, ['credit_card'], 'Upskilling'],
  ],
};

// Deterministic random numbers so every run produces the same demo data
let state = 42;
const rand = () => {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
};
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100;

const monthKey = (date) => date.toISOString().slice(0, 7);
const utcDate = (year, month, day) => new Date(Date.UTC(year, month, day));

function makeExpense(userId, categories, categoryName, date) {
  const [title, min, max, methods, notes = ''] = pick(TEMPLATES[categoryName]);
  return {
    user: userId,
    title,
    amount: between(min, max),
    category: categories[categoryName],
    date,
    paymentMethod: pick(methods),
    notes,
  };
}

/** Expenses for one month: rent on the 1st plus `count` random expenses up to `lastDay`. */
function monthExpenses(userId, categories, year, month, lastDay, count, weights) {
  const expenses = [makeExpense(userId, categories, 'Housing', utcDate(year, month, 1))];
  const names = Object.entries(weights).flatMap(([name, w]) => Array(w).fill(name));
  for (let i = 0; i < count; i += 1) {
    const day = 1 + Math.floor(rand() * lastDay);
    expenses.push(makeExpense(userId, categories, pick(names), utcDate(year, month, day)));
  }
  return expenses;
}

const total = (expenses) => expenses.reduce((sum, e) => sum + e.amount, 0);

async function seedDemo() {
  await connectDB();
  await seedData();

  const categoryDocs = await Category.find({ name: { $in: Object.keys(TEMPLATES) } });
  const categories = Object.fromEntries(categoryDocs.map((c) => [c.name, c._id]));
  const missing = Object.keys(TEMPLATES).filter((name) => !categories[name]);
  if (missing.length) {
    // Recreate starter categories that were deleted, so every template has a category
    for (const name of missing) {
      const created = await Category.create({ name });
      categories[name] = created._id;
    }
  }

  // Remove previous demo data
  const emails = [DEMO_USER, ...EXTRA_USERS].map((u) => u.email);
  const oldUsers = await User.find({ email: { $in: emails } }, '_id');
  const oldIds = oldUsers.map((u) => u._id);
  await Promise.all([Expense.deleteMany({ user: { $in: oldIds } }), Budget.deleteMany({ user: { $in: oldIds } })]);
  await User.deleteMany({ _id: { $in: oldIds } });

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = now.getUTCDate();
  const daysIn = (m) => new Date(Date.UTC(year, m + 1, 0)).getUTCDate();

  // ---- demo user ----
  const demo = await User.create({ ...DEMO_USER, password: DEMO_PASSWORD });
  const everyday = { 'Food & Dining': 6, Transport: 5, Utilities: 3, Entertainment: 2, Health: 1, Shopping: 2, Education: 1 };

  const twoAgo = monthExpenses(demo._id, categories, year, month - 2, daysIn(month - 2), 24, everyday);
  const lastMonth = monthExpenses(demo._id, categories, year, month - 1, daysIn(month - 1), 32, {
    ...everyday,
    Shopping: 5,
    Entertainment: 4,
  });
  const thisMonth = monthExpenses(demo._id, categories, year, month, Math.max(1, today), Math.max(6, today * 1.2), everyday);
  await Expense.insertMany([...twoAgo, ...lastMonth, ...thisMonth]);

  const round10 = (n) => Math.ceil(n / 10) * 10;
  const budgets = [
    { month: monthKey(utcDate(year, month - 2, 1)), amount: round10(total(twoAgo) * 1.25) }, // within
    { month: monthKey(utcDate(year, month - 1, 1)), amount: round10(total(lastMonth) * 0.85) }, // over
    { month: monthKey(utcDate(year, month, 1)), amount: round10(total(thisMonth) / 0.86) }, // approaching
  ];
  await Budget.insertMany(budgets.map((b) => ({ ...b, user: demo._id })));

  // ---- extra users, created a few days apart so "recently registered" has an order ----
  for (const [index, info] of EXTRA_USERS.entries()) {
    const user = await User.create({ ...info, password: DEMO_PASSWORD });
    await User.updateOne(
      { _id: user._id },
      { $set: { createdAt: new Date(now.getTime() - (EXTRA_USERS.length - index) * 86400000) } },
      { timestamps: false }
    );
    const light = { 'Food & Dining': 4, Transport: 3, Utilities: 1, Entertainment: 1 };
    const expenses = [
      ...monthExpenses(user._id, categories, year, month - 1, daysIn(month - 1), 6 + index * 2, light),
      ...monthExpenses(user._id, categories, year, month, Math.max(1, today), 3 + index, light),
    ];
    await Expense.insertMany(expenses);
    await Budget.create({ user: user._id, month: monthKey(now), amount: round10(total(expenses) * 0.9) });
  }

  const count = await Expense.countDocuments({ user: demo._id });
  console.log(`Demo user ready: ${DEMO_USER.email} / ${DEMO_PASSWORD} (${count} expenses)`);
  console.log(`Extra users: ${EXTRA_USERS.map((u) => u.email).join(', ')}`);
  console.log('Budgets:', budgets.map((b) => `${b.month}=${b.amount}`).join(', '));

  await mongoose.disconnect();
}

seedDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
