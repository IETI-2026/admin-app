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
