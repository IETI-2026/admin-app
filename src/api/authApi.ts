import type { AuthUser, LoginPayload } from '../types/auth'
import type { AuthTokens } from '../types/session'
import { apiPath } from '../lib/apiPath'
import { httpClient } from './httpClient'
import { extractAuthTokens, normalizeAuthUser } from './responseParsers'

export const loginRequest = async (payload: LoginPayload): Promise<AuthTokens> => {
  const response = await httpClient.post(apiPath('/auth/login'), payload)
  const tokens = extractAuthTokens(response.data)

  if (!tokens) {
    throw new Error('No se recibió un token válido en la autenticación.')
  }

  return tokens
}

export const meRequest = async (): Promise<AuthUser> => {
  const response = await httpClient.get(apiPath('/auth/me'))
  const user = normalizeAuthUser(response.data)

  if (!user) {
    throw new Error('No fue posible validar el perfil del administrador.')
  }

  return user
}

export const logoutRequest = async (): Promise<void> => {
  try {
    await httpClient.post(apiPath('/auth/logout'), {})
  } catch {
    // Silent fail for optional endpoint.
  }
}
