import api from './client';
import type { DashboardData } from '../types';

export const dashboardApi = {
  get: (month: string, signal?: AbortSignal) =>
    api.get<DashboardData>('/dashboard', { params: { month }, signal }).then((r) => r.data),
};
