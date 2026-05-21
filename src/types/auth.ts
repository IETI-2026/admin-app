export type AllowedRole = 'ADMIN' | 'MODERATOR'

export interface AuthUser {
  id?: string
  fullName?: string
  email?: string
  role: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface CreateAdminPayload {
  fullName: string
  role: AllowedRole
  email?: string
  phoneNumber?: string
  passwordHash?: string
}
