import type { AuthSessionState } from '../modules/auth/hooks/useAuthSession';

export interface AdminLayoutContextValue {
  authState: AuthSessionState;
  onLogout: () => Promise<void>;
}
