import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types';

const TOKEN_KEY = 'retain_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let unauthorizedHandler: (() => void) | null = null;

/** Registers a callback that runs whenever the API rejects the session (HTTP 401). */
export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthRequest = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');
    if (error.response?.status === 401 && !isAuthRequest) unauthorizedHandler?.();
    return Promise.reject(error);
  }
);

/** Extracts a human readable message from any error thrown by an API call. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Unable to reach the server. Check your connection.';
    const { message, details } = error.response.data ?? {};
    if (details) return Object.values(details).join(' ');
    return message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default api;
