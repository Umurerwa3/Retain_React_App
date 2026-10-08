import api from './client';
import type { Budget, BudgetSummary } from '../types';

export const budgetApi = {
  list: (signal?: AbortSignal) => api.get<{ budgets: Budget[] }>('/budgets', { signal }).then((r) => r.data.budgets),
  getSummary: (month: string, signal?: AbortSignal) =>
    api.get<{ summary: BudgetSummary }>(`/budgets/${month}`, { signal }).then((r) => r.data.summary),
  set: (month: string, amount: number) =>
    api.put<{ summary: BudgetSummary }>(`/budgets/${month}`, { amount }).then((r) => r.data.summary),
  remove: (month: string) => api.delete<{ message: string }>(`/budgets/${month}`).then((r) => r.data),
};
