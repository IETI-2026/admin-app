import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '../../../core/http/http-error';
import type {
  ProviderProfileResponse,
  ProviderVerificationAction,
} from '../../../types/api';
import { getUsersRequest } from '../../users/api/users.api';
import {
  getProviderProfileRequest,
  verifyProviderRequest,
} from '../api/providers.api';

interface UseProvidersAdminResult {
  providers: ProviderProfileResponse[];
  isLoading: boolean;
  error: string | null;
  loadProviders: () => Promise<void>;
  updateVerification: (
    userId: string,
    action: ProviderVerificationAction,
  ) => Promise<void>;
}

export function useProvidersAdmin(active: boolean): UseProvidersAdminResult {
  const [providers, setProviders] = useState<ProviderProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const usersResponse = await getUsersRequest({ page: 0, limit: 40 });
      const profileResults = await Promise.allSettled(
        usersResponse.users.map((user) => getProviderProfileRequest(user.id)),
      );

      const profiles = profileResults
        .filter(
          (
            profile,
          ): profile is PromiseFulfilledResult<ProviderProfileResponse> =>
            profile.status === 'fulfilled',
        )
        .map((profile) => profile.value);

      setProviders(profiles);
    } catch (requestError) {
      const message =
        requestError instanceof HttpError
          ? requestError.message
          : 'No fue posible cargar técnicos.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }

    void loadProviders();
  }, [active, loadProviders]);

  const updateVerification = useCallback(
    async (userId: string, action: ProviderVerificationAction): Promise<void> => {
      setError(null);
      try {
        await verifyProviderRequest(userId, action);
        await loadProviders();
      } catch (requestError) {
        const message =
          requestError instanceof HttpError
            ? requestError.message
            : 'No se pudo actualizar la verificación del técnico.';
        setError(message);
      }
    },
    [loadProviders],
  );

  return {
    providers,
    isLoading,
    error,
    loadProviders,
    updateVerification,
  };
}
