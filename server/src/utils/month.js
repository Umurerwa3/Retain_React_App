import ApiError from './ApiError.js';

const MONTH_RX = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Current month as "YYYY-MM" (UTC). */
export const currentMonth = () => new Date().toISOString().slice(0, 7);

/**
 * Validates a "YYYY-MM" string (defaulting to the current month) and returns
 * the month plus its [start, end) date range in UTC.
 */
export function monthRange(month = currentMonth()) {
  if (!MONTH_RX.test(month)) throw ApiError.badRequest('Month must be in YYYY-MM format');
  const [year, m] = month.split('-').map(Number);
  return {
    month,
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1)),
  };
}
