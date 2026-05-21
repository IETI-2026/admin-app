export interface PendingDocumentMeta {
  id: string
  userId: string
  fileName: string
  mimeType: string
  receivedAt: string
}

export interface PendingDocumentImage extends PendingDocumentMeta {
  fileBase64: string
}

export interface PendingDocumentsResponse {
  items: PendingDocumentMeta[]
  total: number
}
