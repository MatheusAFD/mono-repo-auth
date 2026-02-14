// Shared domain types used across frontend and backend

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type Result<T, E = Error> = [E, null] | [null, T]

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}
