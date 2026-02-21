import { apiRequest } from '../../../core/http/api-request';
import type {
  AuthMeResponse,
  AuthResponse,
  LoginPayload,
  UserResponse,
} from '../../../types/api';

export function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>({
    url: '/auth/login',
    method: 'POST',
    data: payload,
  });
}

export function getGoogleAuthUrlRequest(): Promise<{ authUrl: string }> {
  return apiRequest<{ authUrl: string }>({
    url: '/auth/google',
    method: 'GET',
  });
}

export function getAuthMeRequest(): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>({
    url: '/auth/me',
    method: 'GET',
  });
}

export function getCurrentUserRequest(): Promise<UserResponse> {
  return apiRequest<UserResponse>({
    url: '/users/me',
    method: 'GET',
  });
}

export function logoutRequest(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({
    url: '/auth/logout',
    method: 'POST',
  });
}
