import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '../../../core/http/http-error';
import type {
  ServiceRequestResponse,
  ServiceRequestStatus,
} from '../../../types/api';
import { getServiceRequestsRequest } from '../api/service-requests.api';

interface UseServiceRequestsAdminResult {
  requests: ServiceRequestResponse[];
  requestStatusFilter: ServiceRequestStatus | 'ALL';
  requestCityFilter: string;
  setRequestStatusFilter: (status: ServiceRequestStatus | 'ALL') => void;
  setRequestCityFilter: (city: string) => void;
  isLoading: boolean;
  error: string | null;
  loadRequests: () => Promise<void>;
}

export function useServiceRequestsAdmin(
  active: boolean,
): UseServiceRequestsAdminResult {
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [requestStatusFilter, setRequestStatusFilter] =
    useState<ServiceRequestStatus | 'ALL'>('ALL');
  const [requestCityFilter, setRequestCityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getServiceRequestsRequest({
        page: 0,
        limit: 20,
        status:
          requestStatusFilter === 'ALL' ? undefined : requestStatusFilter,
        serviceCity: requestCityFilter.trim() || undefined,
      });
      setRequests(response.requests);
    } catch (requestError) {
      const message =
        requestError instanceof HttpError
          ? requestError.message
          : 'No fue posible cargar solicitudes.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [requestCityFilter, requestStatusFilter]);

  useEffect(() => {
    if (!active) {
      return;
    }

    void loadRequests();
  }, [active, loadRequests]);

  return {
    requests,
    requestStatusFilter,
    requestCityFilter,
    setRequestStatusFilter,
    setRequestCityFilter,
    isLoading,
    error,
    loadRequests,
  };
}
