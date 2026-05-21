import axios from 'axios'

const FALLBACK_ERROR_MESSAGE = 'No pudimos completar la operación. Inténtalo nuevamente.'

const extractMessageFromPayload = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const record = payload as Record<string, unknown>
  const nested =
    record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : null
  const candidates = [record.message, record.error, record.detail, nested?.message, nested?.error]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate
    }

    if (Array.isArray(candidate)) {
      const message = candidate.filter((entry): entry is string => typeof entry === 'string').join(' | ')
      if (message.trim().length > 0) {
        return message
      }
    }
  }

  return null
}

export const getErrorMessage = (error: unknown, fallback?: string): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = extractMessageFromPayload(error.response?.data)
    if (serverMessage) {
      return serverMessage
    }

    switch (error.response?.status) {
      case 400:
        return 'La solicitud contiene datos inválidos. Verifica e intenta de nuevo.'
      case 401:
        return 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'No encontramos la información solicitada.'
      case 409:
        return 'Se detectó un conflicto con el estado actual del recurso.'
      case 500:
        return 'El servidor presentó un error interno. Inténtalo nuevamente.'
      default:
        return fallback ?? FALLBACK_ERROR_MESSAGE
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback ?? FALLBACK_ERROR_MESSAGE
}
