import api from './client';
import type { Expense, ExpenseInput, ExpenseListResponse } from '../types';

export const expenseApi = {
  list: (params: Record<string, string | number>, signal?: AbortSignal) =>
    api.get<ExpenseListResponse>('/expenses', { params, signal }).then((r) => r.data),
  get: (id: string, signal?: AbortSignal) =>
    api.get<{ expense: Expense }>(`/expenses/${id}`, { signal }).then((r) => r.data.expense),
  create: (data: ExpenseInput) => api.post<{ expense: Expense }>('/expenses', data).then((r) => r.data.expense),
  update: (id: string, data: Partial<ExpenseInput>) =>
    api.put<{ expense: Expense }>(`/expenses/${id}`, data).then((r) => r.data.expense),
  remove: (id: string) => api.delete<{ message: string }>(`/expenses/${id}`).then((r) => r.data),
};
