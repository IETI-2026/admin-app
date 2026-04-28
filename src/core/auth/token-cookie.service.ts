import Cookies from 'js-cookie';
import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_EXPIRES_DAYS,
  REFRESH_TOKEN_COOKIE,
} from '../constants/auth.constants';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function setAuthTokens(tokens: AuthTokens): void {
  Cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  });

  Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  });
}

export function getAuthTokens(): AuthTokens | null {
  const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);
  const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export function clearAuthTokens(): void {
  Cookies.remove(ACCESS_TOKEN_COOKIE);
  Cookies.remove(REFRESH_TOKEN_COOKIE);
}
