export type ReviewQueueStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ALL'

export type DocumentDecision = 'APPROVED' | 'REJECTED'

export interface ReviewQueueItem {
  documentId: string
  providerUserId: string
  providerProfileId: string
  providerFullName: string
  providerDocumentId: string
  documentType: string
  documentStatus: string
  providerVerificationStatus: string
  createdAt: string
}

export interface ProviderDocument {
  id: string
  providerProfileId: string
  documentType: string
  documentHash: string
  fileUrl: string
  issuedAt?: string | null
  expiresAt?: string | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  status: string
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface DecisionPayload {
  decision: DocumentDecision
  reason?: string
}

export interface ProviderProfile {
  id?: string
  providerUserId?: string
  providerVerificationStatus?: string
  verificationStatus?: string
  status?: string
}

export interface ReviewQueueQueryParams {
  page: number
  limit: number
  status?: ReviewQueueStatus
}
