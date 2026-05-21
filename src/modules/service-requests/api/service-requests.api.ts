import { apiRequest } from '../../../core/http/api-request';
import { toQueryParams } from '../../../core/http/query-params';
import type {
  GetServiceRequestsQuery,
  ServiceRequestsListResponse,
} from '../../../types/api';

export function getServiceRequestsRequest(
  query: GetServiceRequestsQuery,
): Promise<ServiceRequestsListResponse> {
  const params = toQueryParams({
    status: query.status,
    userId: query.userId,
    technicianUserId: query.technicianUserId,
    serviceCity: query.serviceCity,
    page: query.page,
    limit: query.limit,
  });

  return apiRequest<ServiceRequestsListResponse>({
    url: `/api/service-requests${params}`,
    method: 'GET',
  });
}
