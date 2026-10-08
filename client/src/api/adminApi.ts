import api from './client';
import type { AdminInsights } from '../types';

export const adminApi = {
  insights: (signal?: AbortSignal) => api.get<AdminInsights>('/admin/insights', { signal }).then((r) => r.data),
};
