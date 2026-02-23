export type RoleName = 'USER' | 'PROVIDER' | 'ADMIN' | 'MODERATOR';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export type ServiceRequestStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type UrgencyLevel = 'baja' | 'media' | 'alta';

export type ProviderVerificationAction = 'APPROVE' | 'REJECT' | 'SUSPEND';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  profilePhotoUrl?: string;
  roles: RoleName[];
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  user?: AuthUser;
}

export interface AuthMeResponse {
  id: string;
  email: string | null;
  fullName: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: string;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateMyProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
}

export interface UpdateUserPayload {
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  documentId?: string;
  profilePhotoUrl?: string;
  skills?: string[];
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLoginAt?: string;
}

export interface UserResponse {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string;
  documentId: string | null;
  profilePhotoUrl: string | null;
  skills: string[];
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationUpdate: string | null;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface UsersListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  status?: UserStatus;
}

export interface ProviderProfileResponse {
  id: string;
  userId: string;
  bio: string | null;
  verificationStatus: string;
  averageRating: number;
  totalRatings: number;
  totalCompletedServices: number;
  totalCancelledServices: number;
  isAvailable: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  coverageRadiusKm: number;
  nequiNumber: string | null;
  daviplataNumber: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianResponseDto {
  id: string;
  serviceRequestId: string;
  technicianUserId: string;
  status: 'ACCEPTED' | 'REJECTED';
  reason?: string | null;
  respondedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestResponse {
  id: string;
  userId: string;
  assignedTechnicianId: string | null;
  problema: string;
  requestedSkills: string[];
  status: ServiceRequestStatus;
  urgency: UrgencyLevel;
  latitude: number;
  longitude: number;
  addressText: string;
  serviceCity: string;
  technicianResponses: TechnicianResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestsListResponse {
  requests: ServiceRequestResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetServiceRequestsQuery {
  status?: ServiceRequestStatus;
  userId?: string;
  technicianUserId?: string;
  serviceCity?: string;
  page?: number;
  limit?: number;
}

export interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
