import axios from 'axios'
import type { PaginatedResult } from '../types/api'
import { apiPath } from '../lib/apiPath'
import type {
  DecisionPayload,
  ProviderDocument,
  ProviderProfile,
  ReviewQueueItem,
  ReviewQueueQueryParams,
} from '../types/provider'
import { httpClient } from './httpClient'
import { normalizePaginatedResponse } from './responseParsers'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return undefined
}

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = asString(source[key])
    if (value) {
      return value
    }
  }

  return undefined
}

const normalizeReviewQueueItem = (item: unknown): ReviewQueueItem | null => {
  if (!isRecord(item)) {
    return null
  }

  const providerUserId = pickString(item, ['providerUserId', 'provider_user_id', 'userId', 'user_id'])
  const documentId = pickString(item, ['documentId', 'document_id', 'id'])

  if (!providerUserId || !documentId) {
    return null
  }

  return {
    documentId,
    providerUserId,
    providerProfileId:
      pickString(item, ['providerProfileId', 'provider_profile_id', 'profileId', 'providerId']) ?? '',
    providerFullName:
      pickString(item, ['providerFullName', 'provider_full_name', 'fullName', 'name', 'providerName']) ??
      providerUserId,
    providerDocumentId:
      pickString(item, ['providerDocumentId', 'provider_document_id', 'documentNumber', 'documentNo']) ??
      documentId,
    documentType: pickString(item, ['documentType', 'document_type', 'type']) ?? 'N/D',
    documentStatus: pickString(item, ['documentStatus', 'document_status', 'status']) ?? 'UNKNOWN',
    providerVerificationStatus:
      pickString(item, [
        'providerVerificationStatus',
        'provider_verification_status',
        'verificationStatus',
        'verification_status',
      ]) ?? 'UNKNOWN',
    createdAt:
      pickString(item, ['createdAt', 'created_at', 'submittedAt', 'submitted_at', 'updatedAt', 'updated_at']) ??
      '',
  }
}

const normalizeProviderDocument = (item: unknown): ProviderDocument | null => {
  if (!isRecord(item)) {
    return null
  }

  const id = pickString(item, ['id', 'documentId', 'document_id'])

  if (!id) {
    return null
  }

  return {
    id,
    providerProfileId: pickString(item, ['providerProfileId', 'provider_profile_id', 'profileId']) ?? '',
    documentType: pickString(item, ['documentType', 'document_type', 'type']) ?? 'N/D',
    documentHash: pickString(item, ['documentHash', 'document_hash', 'hash']) ?? '-',
    fileUrl: pickString(item, ['fileUrl', 'file_url', 'url', 'documentUrl']) ?? '#',
    issuedAt: pickString(item, ['issuedAt', 'issued_at']) ?? null,
    expiresAt: pickString(item, ['expiresAt', 'expires_at']) ?? null,
    verifiedAt: pickString(item, ['verifiedAt', 'verified_at']) ?? null,
    verifiedBy: pickString(item, ['verifiedBy', 'verified_by']) ?? null,
    status: pickString(item, ['status', 'documentStatus', 'document_status']) ?? 'UNKNOWN',
    rejectionReason: pickString(item, ['rejectionReason', 'rejection_reason', 'reason']) ?? null,
    createdAt: pickString(item, ['createdAt', 'created_at']) ?? '',
    updatedAt: pickString(item, ['updatedAt', 'updated_at']) ?? '',
  }
}

const extractCollection = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!isRecord(payload)) {
    return []
  }

  const container = isRecord(payload.data) ? payload.data : payload

  const candidates = [
    container.items,
    container.results,
    container.rows,
    container.data,
    container.documents,
    container.content,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

export const getReviewQueue = async (
  params: ReviewQueueQueryParams,
): Promise<PaginatedResult<ReviewQueueItem>> => {
  const query = {
    page: params.page,
    limit: params.limit,
    status: params.status && params.status !== 'ALL' ? params.status : undefined,
  }

  const response = await httpClient.get(apiPath('/users/admin/provider-review-queue'), { params: query })
  const normalized = normalizePaginatedResponse<unknown>(response.data)
  const items = normalized.items
    .map((item) => normalizeReviewQueueItem(item))
    .filter((item): item is ReviewQueueItem => Boolean(item))

  return {
    ...normalized,
    items,
  }
}

export const getProviderDocuments = async (providerUserId: string): Promise<ProviderDocument[]> => {
  const response = await httpClient.get(apiPath(`/users/${providerUserId}/provider-documents`))
  return extractCollection(response.data)
    .map((item) => normalizeProviderDocument(item))
    .filter((item): item is ProviderDocument => Boolean(item))
}

export const decideDocument = async (
  providerUserId: string,
  documentId: string,
  payload: DecisionPayload,
): Promise<void> => {
  await httpClient.patch(
    apiPath(`/users/${providerUserId}/provider-documents/${documentId}/decision`),
    payload,
  )
}

export const getProviderProfile = async (providerUserId: string): Promise<ProviderProfile | null> => {
  try {
    const response = await httpClient.get(apiPath(`/users/${providerUserId}/provider-profile`))
    const payload = response.data

    if (!isRecord(payload)) {
      return null
    }

    const source = isRecord(payload.data)
      ? payload.data
      : isRecord(payload.profile)
        ? payload.profile
        : payload

    return {
      id: pickString(source, ['id', 'profileId', 'profile_id']),
      providerUserId: pickString(source, ['providerUserId', 'provider_user_id', 'userId', 'user_id']),
      providerVerificationStatus: pickString(source, [
        'providerVerificationStatus',
        'provider_verification_status',
      ]),
      verificationStatus: pickString(source, ['verificationStatus', 'verification_status']),
      status: pickString(source, ['status']),
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }

    throw error
  }
}
