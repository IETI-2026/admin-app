import axios, {
  AxiosHeaders,
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '../../config/env';
import {
  clearAuthTokens,
  getAuthTokens,
  setAuthTokens,
} from '../auth/token-cookie.service';
import type { ApiErrorResponse, AuthResponse } from '../../types/api';
import { HttpError } from './http-error';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const refreshClient: AxiosInstance = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function parseApiError(error: AxiosError<ApiErrorResponse>): HttpError {
  const status = error.response?.status ?? 500;
  const payload = error.response?.data;

  if (Array.isArray(payload?.message)) {
    return new HttpError(payload.message.join(' | '), status);
  }

  return new HttpError(
    payload?.message || payload?.error || error.message || 'Error de red',
    status,
  );
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getAuthTokens();

  if (!tokens?.refreshToken) {
    return null;
  }

  try {
    const response = await refreshClient.post<AuthResponse>(
      '/api/auth/refresh',
      {
        refreshToken: tokens.refreshToken,
      },
    );

    if (!response.data.accessToken || !response.data.refreshToken) {
      clearAuthTokens();
      return null;
    }

    setAuthTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response.data.accessToken;
  } catch {
    clearAuthTokens();
    return null;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const tokens = getAuthTokens();

  if (tokens?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        return Promise.reject(new HttpError('Tu sesión expiró. Inicia sesión de nuevo.', 401));
      }

      const headers = new AxiosHeaders(originalRequest.headers);
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      originalRequest.headers = headers;

      return apiClient(originalRequest as AxiosRequestConfig);
    }

    return Promise.reject(parseApiError(error));
  },
);
