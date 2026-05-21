import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getErrorMessage } from '../api/error'
import { loginRequest, logoutRequest, meRequest } from '../api/authApi'
import { setTokenRefreshHandler, setUnauthorizedHandler } from '../api/httpClient'
import { clearStoredAccessToken, getStoredAccessToken, setStoredSession } from '../lib/authToken'
import type { AllowedRole, AuthUser } from '../types/auth'
import type { AuthTokens } from '../types/session'

const ALLOWED_ROLES: AllowedRole[] = ['ADMIN', 'MODERATOR']

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionNotice: string | null
  login: (email: string, password: string) => Promise<void>
  authenticateWithTokens: (tokens: AuthTokens) => Promise<void>
  logout: () => Promise<void>
  dismissSessionNotice: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const isAllowedRole = (role: string): role is AllowedRole =>
  ALLOWED_ROLES.includes(role as AllowedRole)

const normalizeRoleError = (): never => {
  throw new Error('Tu usuario no tiene rol permitido para esta aplicación.')
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionNotice, setSessionNotice] = useState<string | null>(null)

  const applySession = useCallback((accessTokenValue: string, nextUser: AuthUser) => {
    setAccessToken(accessTokenValue)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    clearStoredAccessToken()
    setAccessToken(null)
    setUser(null)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginRequest({ email, password })
      setStoredSession(tokens)

      try {
        const profile = await meRequest()

        if (!isAllowedRole(profile.role)) {
          clearSession()
          normalizeRoleError()
        }

        setSessionNotice(null)
        setAccessToken(tokens.accessToken)
        setUser(profile)
      } catch (error) {
        clearSession()
        throw new Error(getErrorMessage(error))
      }
    },
    [clearSession],
  )

  const authenticateWithTokens = useCallback(
    async (tokens: AuthTokens) => {
      setStoredSession(tokens)

      try {
        const profile = await meRequest()

        if (!isAllowedRole(profile.role)) {
          clearSession()
          normalizeRoleError()
        }

        setSessionNotice(null)
        setAccessToken(tokens.accessToken)
        setUser(profile)
      } catch (error) {
        clearSession()
        throw new Error(getErrorMessage(error))
      }
    },
    [clearSession],
  )

  const logout = useCallback(async () => {
    await logoutRequest()
    clearSession()
  }, [clearSession])

  const dismissSessionNotice = useCallback(() => {
    setSessionNotice(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      setSessionNotice('Tu sesión expiró. Inicia sesión nuevamente.')
    })

    setTokenRefreshHandler((tokens) => {
      setStoredSession(tokens)
      setAccessToken(tokens.accessToken)
    })

    return () => {
      setUnauthorizedHandler(null)
      setTokenRefreshHandler(null)
    }
  }, [clearSession])

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      const token = getStoredAccessToken()

      if (!token) {
        if (mounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        const profile = await meRequest()

        if (!isAllowedRole(profile.role)) {
          clearSession()
          normalizeRoleError()
        }

        if (!mounted) {
          return
        }

        applySession(token, profile)
      } catch {
        if (mounted) {
          clearSession()
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [applySession, clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(accessToken && user),
      sessionNotice,
      login,
      authenticateWithTokens,
      logout,
      dismissSessionNotice,
    }),
    [
      accessToken,
      authenticateWithTokens,
      dismissSessionNotice,
      isLoading,
      login,
      logout,
      sessionNotice,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
