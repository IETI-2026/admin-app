export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface StoredSession {
  accessToken: string
  refreshToken?: string
}
