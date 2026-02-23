import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './axios.instance';

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
