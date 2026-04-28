import { useEffect, useMemo, useState } from 'react';
import { HttpError } from '../../../core/http/http-error';
import { getServiceRequestsRequest } from '../../service-requests/api/service-requests.api';
import { getUsersRequest } from '../../users/api/users.api';
import type { ServiceRequestResponse } from '../../../types/api';

export interface DashboardMetrics {
  usersTotal: number;
  usersActive: number;
  usersSuspended: number;
  requestsTotal: number;
  requestsCompleted: number;
  requestsPending: number;
}

interface UseDashboardMetricsResult {
  metrics: DashboardMetrics;
  requests: ServiceRequestResponse[];
  isLoading: boolean;
  error: string | null;
}

const initialMetrics: DashboardMetrics = {
  usersTotal: 0,
  usersActive: 0,
  usersSuspended: 0,
  requestsTotal: 0,
  requestsCompleted: 0,
  requestsPending: 0,
};

export function useDashboardMetrics(): UseDashboardMetricsResult {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const [usersTotal, usersActive, usersSuspended, requestsAll, requestsCompleted, requestsPending] =
          await Promise.all([
            getUsersRequest({ page: 0, limit: 1 }),
            getUsersRequest({ page: 0, limit: 1, status: 'ACTIVE' }),
            getUsersRequest({ page: 0, limit: 1, status: 'SUSPENDED' }),
            getServiceRequestsRequest({ page: 0, limit: 100 }),
            getServiceRequestsRequest({ page: 0, limit: 1, status: 'COMPLETED' }),
            getServiceRequestsRequest({ page: 0, limit: 1, status: 'REQUESTED' }),
          ]);

        setMetrics({
          usersTotal: usersTotal.total,
          usersActive: usersActive.total,
          usersSuspended: usersSuspended.total,
          requestsTotal: requestsAll.total,
          requestsCompleted: requestsCompleted.total,
          requestsPending: requestsPending.total,
        });

        setRequests(requestsAll.requests);
      } catch (requestError) {
        const message =
          requestError instanceof HttpError
            ? requestError.message
            : 'No se pudieron cargar las métricas del dashboard.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMetrics();
  }, []);

  return useMemo(
    () => ({
      metrics,
      requests,
      isLoading,
      error,
    }),
    [metrics, requests, isLoading, error],
  );
}
