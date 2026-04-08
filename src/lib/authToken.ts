import type { StoredSession } from '../types/session'

const SESSION_STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY ?? 'cameyo_admin_session'

let inMemoryAccessToken: string | null = null
let inMemoryRefreshToken: string | null = null

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const getStoredAccessToken = (): string | null => {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken
  }

  if (!canUseStorage()) {
    return null
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const parsed = JSON.parse(rawSession) as StoredSession
    inMemoryAccessToken = parsed.accessToken ?? null
    inMemoryRefreshToken = parsed.refreshToken ?? null
    return inMemoryAccessToken
  } catch {
    // Backward compatibility for older plain-token storage.
    inMemoryAccessToken = rawSession
    inMemoryRefreshToken = null
    return inMemoryAccessToken
  }
}

export const getStoredRefreshToken = (): string | null => {
  if (inMemoryRefreshToken) {
    return inMemoryRefreshToken
  }

  getStoredAccessToken()
  return inMemoryRefreshToken
}

export const setStoredSession = (session: StoredSession): void => {
  inMemoryAccessToken = session.accessToken
  inMemoryRefreshToken = session.refreshToken ?? null

  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export const setStoredAccessToken = (token: string): void => {
  setStoredSession({
    accessToken: token,
    refreshToken: inMemoryRefreshToken ?? undefined,
  })
}

export const clearStoredAccessToken = (): void => {
  inMemoryAccessToken = null
  inMemoryRefreshToken = null

  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}
