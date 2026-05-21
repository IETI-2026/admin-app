import { apiRequest } from '../../../core/http/api-request';
import type {
  ProviderProfileResponse,
  ProviderVerificationAction,
} from '../../../types/api';

export function getProviderProfileRequest(
  userId: string,
): Promise<ProviderProfileResponse> {
  return apiRequest<ProviderProfileResponse>({
    url: `/api/users/${userId}/provider-profile`,
    method: 'GET',
  });
}

export function verifyProviderRequest(
  userId: string,
  action: ProviderVerificationAction,
): Promise<ProviderProfileResponse> {
  return apiRequest<ProviderProfileResponse>({
    url: `/api/users/${userId}/verify-provider`,
    method: 'PATCH',
    data: { action },
  });
}
