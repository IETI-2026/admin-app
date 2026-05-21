import { apiRequest } from '../../../core/http/api-request';
import type {
  AuthMeResponse,
  AuthResponse,
  LoginPayload,
  UpdateMyProfilePayload,
  UserResponse,
} from '../../../types/api';

export function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>({
    url: '/api/auth/login',
    method: 'POST',
    data: payload,
  });
}

export function getGoogleAuthUrlRequest(): Promise<{ authUrl: string }> {
  return apiRequest<{ authUrl: string }>({
    url: '/api/auth/google',
    method: 'GET',
  });
}

export function getAuthMeRequest(): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>({
    url: '/api/auth/me',
    method: 'GET',
  });
}

export function getCurrentUserRequest(): Promise<UserResponse> {
  return apiRequest<UserResponse>({
    url: '/api/users/me',
    method: 'GET',
  });
}

export function logoutRequest(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({
    url: '/api/auth/logout',
    method: 'POST',
  });
}

export function updateMyProfileRequest(
  payload: UpdateMyProfilePayload,
): Promise<UserResponse> {
  return apiRequest<UserResponse>({
    url: '/api/users/me',
    method: 'PATCH',
    data: payload,
  });
}
