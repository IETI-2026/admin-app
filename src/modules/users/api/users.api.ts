import { apiRequest } from '../../../core/http/api-request';
import { toQueryParams } from '../../../core/http/query-params';
import type {
  GetUsersQuery,
  UpdateUserPayload,
  UserResponse,
  UsersListResponse,
} from '../../../types/api';

export function getUsersRequest(query: GetUsersQuery): Promise<UsersListResponse> {
  const params = toQueryParams({
    page: query.page,
    limit: query.limit,
    status: query.status,
  });

  return apiRequest<UsersListResponse>({
    url: `/api/users${params}`,
    method: 'GET',
  });
}

export function updateUserRequest(
  userId: string,
  payload: UpdateUserPayload,
): Promise<UserResponse> {
  return apiRequest<UserResponse>({
    url: `/api/users/${userId}`,
    method: 'PATCH',
    data: payload,
  });
}

export function softDeleteUserRequest(userId: string): Promise<void> {
  return apiRequest<void>({
    url: `/api/users/${userId}`,
    method: 'DELETE',
  });
}

export function hardDeleteUserRequest(userId: string): Promise<void> {
  return apiRequest<void>({
    url: `/api/users/${userId}/hard`,
    method: 'DELETE',
  });
}
