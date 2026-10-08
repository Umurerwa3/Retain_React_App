import api from './client';
import type { Category, CategoryInput } from '../types';

export const categoryApi = {
  list: (signal?: AbortSignal) =>
    api.get<{ categories: Category[] }>('/categories', { signal }).then((r) => r.data.categories),
  create: (data: CategoryInput) =>
    api.post<{ category: Category }>('/categories', data).then((r) => r.data.category),
  update: (id: string, data: Partial<CategoryInput>) =>
    api.put<{ category: Category }>(`/categories/${id}`, data).then((r) => r.data.category),
  remove: (id: string) =>
    api.delete<{ message: string; reassigned: number }>(`/categories/${id}`).then((r) => r.data),
};
