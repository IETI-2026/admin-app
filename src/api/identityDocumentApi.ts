import type { PendingDocumentImage, PendingDocumentMeta, PendingDocumentsResponse } from '../types/identityDocument'
import { localClient } from './localClient'

export const getPendingDocuments = async (userId?: string): Promise<PendingDocumentMeta[]> => {
  const params = userId ? { userId } : {}
  const response = await localClient.get<PendingDocumentsResponse>(
    '/admin-api/document-verification',
    { params },
  )
  return response.data.items
}

export const viewAndConsumeDocument = async (id: string): Promise<PendingDocumentImage> => {
  const response = await localClient.get<PendingDocumentImage>(
    `/admin-api/document-verification/${id}/image`,
  )
  return response.data
}
