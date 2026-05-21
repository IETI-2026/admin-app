import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { apiPath } from '../lib/apiPath'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredSession,
} from '../lib/authToken'
import type { AuthTokens } from '../types/session'
import { extractAuthTokens } from './responseParsers'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? 'public'
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 15000)

let unauthorizedHandler: (() => void) | null = null
let tokenRefreshHandler: ((tokens: AuthTokens) => void) | null = null
let refreshPromise: Promise<AuthTokens | null> | null = null

const rawHttpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'X-Tenant-ID': TENANT_ID,
  },
})

const refreshAccessToken = async (): Promise<AuthTokens | null> => {
  const refreshToken = getStoredRefreshToken()

  try {
    const response = await rawHttpClient.post(apiPath('/auth/refresh'), {
      refreshToken: refreshToken ?? undefined,
    })
    const tokens = extractAuthTokens(response.data)

    if (!tokens) {
      return null
    }

    setStoredSession(tokens)
    tokenRefreshHandler?.(tokens)
    return tokens
  } catch {
    return null
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
})

httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()
  const headers = config.headers ?? {}

  headers['X-Tenant-ID'] = TENANT_ID

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  config.headers = headers
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (status !== 401 || !originalRequest) {
      throw error
    }

    const url = originalRequest.url ?? ''
    const isAuthEndpoint = url.includes(apiPath('/auth/login')) || url.includes(apiPath('/auth/refresh'))

    if (originalRequest._retry || isAuthEndpoint) {
      unauthorizedHandler?.()
      throw error
    }

    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const refreshedTokens = await refreshPromise

    if (refreshedTokens?.accessToken) {
      const headers = originalRequest.headers ?? {}
      headers.Authorization = `Bearer ${refreshedTokens.accessToken}`
      headers['X-Tenant-ID'] = TENANT_ID
      originalRequest.headers = headers
      return httpClient(originalRequest)
    }

    clearStoredAccessToken()
    unauthorizedHandler?.()
    throw error
  },
)

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler
}

export const setTokenRefreshHandler = (handler: ((tokens: AuthTokens) => void) | null): void => {
  tokenRefreshHandler = handler
}
