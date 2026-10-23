/** Error codes returned by the Quarkus backend (ErrorResponse.error) plus client-side codes. */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CANCELED'
  | 'UNKNOWN'

/** Shape of backend error bodies (rest/dto/ErrorResponse.java). */
export interface ErrorResponse {
  error: string
  message: string
}

/** Generic paginated response – the backend has no pagination yet, prepared for future endpoints. */
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

/** Result of a validation function: an error message, or null when valid. */
export type ValidationResult = string | null
