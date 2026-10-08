import type { BudgetStatus, PaymentMethod } from '../types';

const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'USD';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

/**
 * Formats an ISO date for display. Expense dates are calendar days stored at UTC midnight,
 * so they are shown in UTC to avoid slipping to the previous day in western time zones.
 */
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
  new Date(iso).toLocaleDateString(undefined, { timeZone: 'UTC', ...options });

/** Formats a timestamp (e.g. createdAt) in the viewer's time zone. */
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** ISO date -> "YYYY-MM-DD" for <input type="date"> */
export const toDateInputValue = (iso: string) => iso.slice(0, 10);

export const todayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

/** Current month as "YYYY-MM" in the viewer's time zone. */
export const currentMonthValue = () => todayInputValue().slice(0, 7);

/** "2026-10" -> "October 2026" */
export const formatMonth = (month: string) => {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** Shifts a "YYYY-MM" month by a number of months. */
export const shiftMonth = (month: string, delta: number) => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
};

/** First and last day of a "YYYY-MM" month as date input values. */
export const monthBounds = (month: string) => {
  const [year, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return { startDate: `${month}-01`, endDate: `${month}-${String(last).padStart(2, '0')}` };
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  credit_card: 'Credit card',
  debit_card: 'Debit card',
  mobile_money: 'Mobile money',
  bank_transfer: 'Bank transfer',
  other: 'Other',
};

export const BUDGET_STATUS: Record<BudgetStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  within: { label: 'Within budget', color: 'success' },
  approaching: { label: 'Approaching limit', color: 'warning' },
  over: { label: 'Over budget', color: 'error' },
  no_budget: { label: 'No budget set', color: 'default' },
};
