const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api'

const normalizePrefix = (prefix: string): string => {
  const trimmed = prefix.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizedPrefix = normalizePrefix(API_PREFIX)

export const apiPath = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!normalizedPrefix) {
    return normalizedPath
  }

  return `${normalizedPrefix}${normalizedPath}`
}
