import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearAuthTokens,
  getAuthTokens,
  setAuthTokens,
} from '../../../core/auth/token-cookie.service';
import { HttpError } from '../../../core/http/http-error';
import type { LoginPayload, UserResponse } from '../../../types/api';
import {
  getAuthMeRequest,
  getCurrentUserRequest,
  getGoogleAuthUrlRequest,
  loginRequest,
  logoutRequest,
} from '../api/auth.api';

export interface AuthSessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserResponse | null;
  error: string | null;
}

const initialAuthState: AuthSessionState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};

function canAccessAdmin(user: UserResponse): boolean {
  return user.status !== 'DELETED';
}

export function useAuthSession() {
  const [authState, setAuthState] = useState<AuthSessionState>(initialAuthState);

  const refreshProfile = useCallback(async (): Promise<void> => {
    setAuthState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }));

    try {
      const me = await getAuthMeRequest();
      const hasRequiredRole = me.roles.some(
        (role) => role === 'ADMIN' || role === 'MODERATOR',
      );

      if (!hasRequiredRole) {
        clearAuthTokens();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: 'Acceso denegado. Se requiere rol ADMIN o MODERATOR.',
        });
        return;
      }

      const user = await getCurrentUserRequest();
      if (!canAccessAdmin(user)) {
        clearAuthTokens();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: 'Tu cuenta no tiene permisos para el panel administrativo.',
        });
        return;
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } catch (requestError) {
      clearAuthTokens();
      const message =
        requestError instanceof HttpError
          ? requestError.message
          : 'No fue posible cargar la sesión.';

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    const tokens = getAuthTokens();
    if (!tokens) {
      return;
    }

    void refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      setAuthState((previous) => ({
        ...previous,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await loginRequest(payload);

        if (!response.accessToken || !response.refreshToken) {
          throw new HttpError('No se recibieron tokens válidos.', 401);
        }

        setAuthTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        await refreshProfile();
      } catch (requestError) {
        const message =
          requestError instanceof HttpError
            ? requestError.message
            : 'No se pudo iniciar sesión.';

        setAuthState((previous) => ({
          ...previous,
          isLoading: false,
          error: message,
        }));
      }
    },
    [refreshProfile],
  );

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setAuthState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }));

    try {
      const { authUrl } = await getGoogleAuthUrlRequest();
      window.location.href = authUrl;
    } catch (requestError) {
      const message =
        requestError instanceof HttpError
          ? requestError.message
          : 'No se pudo iniciar sesión con Google.';

      setAuthState((previous) => ({
        ...previous,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const completeOAuthLogin = useCallback(
    async (accessToken: string, refreshToken: string): Promise<void> => {
      setAuthTokens({ accessToken, refreshToken });
      await refreshProfile();
      window.history.replaceState({}, '', '/');
    },
    [refreshProfile],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } catch {
      void 0;
    } finally {
      clearAuthTokens();
      setAuthState(initialAuthState);
    }
  }, []);

  return useMemo(
    () => ({
      authState,
      refreshProfile,
      login,
      loginWithGoogle,
      completeOAuthLogin,
      logout,
    }),
    [
      authState,
      refreshProfile,
      login,
      loginWithGoogle,
      completeOAuthLogin,
      logout,
    ],
  );
}
