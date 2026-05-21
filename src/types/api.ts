export interface PaginatedResult<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AppError {
  message: string
  status?: number
}

// ---- Auth ----

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface AuthMeResponse {
  id?: string
  email?: string
  roles: string[]
}

export interface UpdateMyProfilePayload {
  fullName?: string
  email?: string
  phoneNumber?: string
  profilePhotoUrl?: string
}

export interface ApiErrorResponse {
  message: string | string[]
  error?: string
  statusCode?: number
}

// ---- Users ----

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export interface UserResponse {
  id: string
  fullName: string
  email?: string | null
  phoneNumber?: string | null
  profilePhotoUrl?: string | null
  status: UserStatus
  createdAt?: string
  updatedAt?: string
}

export interface GetUsersQuery {
  page: number
  limit: number
  status?: UserStatus
}

export interface UpdateUserPayload {
  status?: UserStatus
  fullName?: string
  email?: string
  phoneNumber?: string
}

export interface UsersListResponse {
  users: UserResponse[]
  total: number
}

// ---- Providers ----

export type ProviderVerificationAction = 'APPROVE' | 'REJECT' | 'SUSPEND'

export interface ProviderProfileResponse {
  id: string
  userId: string
  verificationStatus: string
  providerVerificationStatus?: string
  status?: string
  skills: string[]
  averageRating: number
  totalCompletedServices: number
  totalCancelledServices: number
}

// ---- Service Requests ----

export type ServiceRequestStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'

export interface ServiceRequestResponse {
  id: string
  status: ServiceRequestStatus
  createdAt: string
  updatedAt?: string
  userId?: string
  technicianUserId?: string
  serviceCity?: string
  problema?: string
  urgency?: string
  assignedTechnicianId?: string | null
  technicianResponses: unknown[]
}

export interface GetServiceRequestsQuery {
  page: number
  limit: number
  status?: ServiceRequestStatus
  userId?: string
  technicianUserId?: string
  serviceCity?: string
}

export interface ServiceRequestsListResponse {
  requests: ServiceRequestResponse[]
  total: number
}
