import type { AuthUser } from '../types/auth'
import type { PaginatedResult } from '../types/api'
import type { AuthTokens } from '../types/session'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

export const extractAccessToken = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    return payload
  }

  if (!isRecord(payload)) {
    return null
  }

  const topLevelTokenCandidates = [payload.accessToken, payload.token, payload.jwt]

  for (const candidate of topLevelTokenCandidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  if (isRecord(payload.data)) {
    const nestedCandidates = [payload.data.accessToken, payload.data.token, payload.data.jwt]

    for (const candidate of nestedCandidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate
      }
    }
  }

  return null
}

export const extractRefreshToken = (payload: unknown): string | null => {
  if (!isRecord(payload)) {
    return null
  }

  const topLevelTokenCandidates = [payload.refreshToken, payload.refresh]

  for (const candidate of topLevelTokenCandidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  if (isRecord(payload.data)) {
    const nestedCandidates = [payload.data.refreshToken, payload.data.refresh]

    for (const candidate of nestedCandidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate
      }
    }
  }

  return null
}

export const extractAuthTokens = (payload: unknown): AuthTokens | null => {
  const accessToken = extractAccessToken(payload)

  if (!accessToken) {
    return null
  }

  return {
    accessToken,
    refreshToken: extractRefreshToken(payload) ?? undefined,
  }
}

export const normalizeAuthUser = (payload: unknown): AuthUser | null => {
  if (!isRecord(payload)) {
    return null
  }

  const candidateSources = [
    payload,
    isRecord(payload.data) ? payload.data : null,
    isRecord(payload.user) ? payload.user : null,
    isRecord(payload.data) && isRecord(payload.data.user) ? payload.data.user : null,
  ].filter((value): value is Record<string, unknown> => Boolean(value))

  const getRoleFromSource = (source: Record<string, unknown>): string => {
    if (typeof source.role === 'string' && source.role.trim()) {
      return source.role.trim().toUpperCase()
    }

    if (Array.isArray(source.roles)) {
      const normalizedRoles = source.roles
        .filter((role): role is string => typeof role === 'string')
        .map((role) => role.trim().toUpperCase())

      if (normalizedRoles.includes('ADMIN')) {
        return 'ADMIN'
      }

      if (normalizedRoles.includes('MODERATOR')) {
        return 'MODERATOR'
      }

      if (normalizedRoles.length > 0) {
        return normalizedRoles[0]
      }
    }

    return ''
  }

  const source =
    candidateSources.find((candidate) => {
      const roleFromCandidate = getRoleFromSource(candidate)
      return Boolean(roleFromCandidate)
    }) ?? candidateSources[0]

  const role = source ? getRoleFromSource(source) : ''

  if (!role) {
    return null
  }

  let id: string | undefined
  if (typeof source.id === 'string') {
    id = source.id
  } else if (typeof source.userId === 'string') {
    id = source.userId
  }

  let fullName: string | undefined
  if (typeof source.fullName === 'string') {
    fullName = source.fullName
  } else if (typeof source.name === 'string') {
    fullName = source.name
  }

  return {
    id,
    fullName,
    email: typeof source.email === 'string' ? source.email : undefined,
    role,
  }
}

const resolveItemsArray = (container: Record<string, unknown>): unknown[] => {
  const keys = ['items', 'results', 'rows', 'data', 'content', 'records'] as const
  for (const key of keys) {
    if (Array.isArray(container[key])) return container[key] as unknown[]
  }
  return []
}

export const normalizePaginatedResponse = <T>(payload: unknown): PaginatedResult<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      page: 0,
      limit: payload.length,
      total: payload.length,
      totalPages: 1,
    }
  }

  if (!isRecord(payload)) {
    return {
      items: [],
      page: 0,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
  }

  const container = isRecord(payload.data) ? payload.data : payload

  const rawItems = resolveItemsArray(container)

  const page = toNumber(
    container.page,
    toNumber(container.currentPage, toNumber(container.pageNumber, toNumber(container.offset, 0))),
  )
  const limit = toNumber(container.limit, toNumber(container.pageSize, toNumber(container.size, 20)))
  const total = toNumber(
    container.total,
    toNumber(container.totalItems, toNumber(container.count, rawItems.length)),
  )
  const totalPages = toNumber(
    container.totalPages,
    Math.max(1, Math.ceil((total || rawItems.length) / Math.max(1, limit))),
  )

  return {
    items: rawItems as T[],
    page,
    limit,
    total,
    totalPages,
  }
}
