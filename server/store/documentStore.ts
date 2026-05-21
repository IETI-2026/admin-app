import { randomUUID } from 'crypto'

export interface PendingDocument {
  id: string
  userId: string
  fileName: string
  mimeType: string
  fileBase64: string
  receivedAt: string
}

export interface PendingDocumentMeta {
  id: string
  userId: string
  fileName: string
  mimeType: string
  receivedAt: string
}

const documents = new Map<string, PendingDocument>()

export const addDocument = (
  userId: string,
  fileName: string,
  mimeType: string,
  fileBase64: string,
): PendingDocumentMeta => {
  const doc: PendingDocument = {
    id: randomUUID(),
    userId,
    fileName,
    mimeType,
    fileBase64,
    receivedAt: new Date().toISOString(),
  }
  documents.set(doc.id, doc)
  return { id: doc.id, userId: doc.userId, fileName: doc.fileName, mimeType: doc.mimeType, receivedAt: doc.receivedAt }
}

export const listDocuments = (): PendingDocumentMeta[] => {
  return Array.from(documents.values()).map(({ id, userId, fileName, mimeType, receivedAt }) => ({
    id,
    userId,
    fileName,
    mimeType,
    receivedAt,
  }))
}

export const getAndDeleteDocument = (id: string): PendingDocument | null => {
  const doc = documents.get(id) ?? null
  if (doc) {
    documents.delete(id)
  }
  return doc
}
