import mongoose from 'mongoose';
import ApiError from './ApiError.js';
import { PAYMENT_METHODS } from '../models/Expense.js';

const SORT_FIELDS = { date: 'date', amount: 'amount', title: 'title', createdAt: 'createdAt' };
const MAX_LIMIT = 100;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toList = (value) =>
  (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map((v) => v.trim())
    .filter(Boolean);

function parseDate(value, name, endOfDay = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw ApiError.badRequest(`Invalid ${name}`);
  // Date-only values ("2026-10-31") are treated as the whole day
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) date.setUTCHours(23, 59, 59, 999);
  return date;
}

function parseAmount(value, name) {
  const n = Number(value);
  if (Number.isNaN(n)) throw ApiError.badRequest(`Invalid ${name}`);
  return n;
}

/**
 * Turns expense list query params into a MongoDB filter, sort and pagination.
 *
 * Supported params: search, category, paymentMethod (comma separated lists),
 * startDate, endDate, minAmount, maxAmount, sortBy, order, page, limit.
 */
export function buildExpenseQuery(userId, query) {
  const filter = { user: userId };

  if (query.search?.trim()) {
    const rx = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ title: rx }, { notes: rx }];
  }

  const categories = toList(query.category);
  if (categories.length) {
    if (!categories.every((id) => mongoose.isValidObjectId(id))) {
      throw ApiError.badRequest('Invalid category filter');
    }
    filter.category = { $in: categories.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  const methods = toList(query.paymentMethod);
  if (methods.length) {
    const invalid = methods.filter((m) => !PAYMENT_METHODS.includes(m));
    if (invalid.length) throw ApiError.badRequest(`Invalid payment method: ${invalid.join(', ')}`);
    filter.paymentMethod = { $in: methods };
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = parseDate(query.startDate, 'startDate');
    if (query.endDate) filter.date.$lte = parseDate(query.endDate, 'endDate', true);
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseAmount(query.minAmount, 'minAmount');
    if (query.maxAmount) filter.amount.$lte = parseAmount(query.maxAmount, 'maxAmount');
  }

  const sortField = SORT_FIELDS[query.sortBy] || 'date';
  const direction = query.order === 'asc' ? 1 : -1;
  // Tie-breaker keeps pagination stable when values are equal
  const sort = { [sortField]: direction, _id: direction };

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || 10));

  return { filter, sort, page, limit, skip: (page - 1) * limit };
}
