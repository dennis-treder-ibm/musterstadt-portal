import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

const BASE_URL = '/api';
const TOKEN_KEY = 'bp_token';

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Attach token from sessionStorage on every request
http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers['X-Auth-Token'] = token;
  }
  return config;
});

// Normalise error responses into ApiError shape
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiError>) => {
    const apiMessage =
      err.response?.data?.error ?? err.message ?? 'Unbekannter Fehler';
    const status = err.response?.status;

    // 401 → clear stale token; AuthContext will redirect
    if (status === 401) {
      clearToken();
    }

    const normalised: ApiError = { error: apiMessage, status };
    return Promise.reject(normalised);
  },
);

export default http;
