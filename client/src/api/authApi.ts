import api from './client';
import type { AuthResponse, Credentials, SignUpData, User } from '../types';

export const authApi = {
  signIn: (data: Credentials) => api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  signUp: (data: SignUpData) => api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
};
