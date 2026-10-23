import axios from 'axios'
import type { ApiErrorCode, ErrorResponse } from '@/types/api'

export interface ApiErrorInit {
  message: string
  status: number | null
  code: ApiErrorCode
  details?: unknown
  cause?: unknown
}

/** Normalised error thrown by every service call. */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: ApiErrorCode
  readonly details: unknown

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause })
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.details = init.details
  }

  /** True when no HTTP response was received (offline, DNS, CORS, timeout). */
  get isNetworkError(): boolean {
    return this.status === null
  }
}

const KNOWN_CODES: readonly ApiErrorCode[] = [
  'BAD_REQUEST',
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'SERVER_ERROR',
]

function isKnownCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && (KNOWN_CODES as readonly string[]).includes(value)
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 400) return 'BAD_REQUEST'
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 408) return 'TIMEOUT'
  if (status >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN'
}

/** Backend error bodies carry `message` (ErrorResponse and LoginResponse alike). */
function readServerError(data: unknown): Partial<ErrorResponse> | null {
  if (typeof data !== 'object' || data === null) return null
  const { error, message } = data as Record<string, unknown>
  if (typeof message !== 'string') return null
  return { message, ...(typeof error === 'string' ? { error } : {}) }
}

/** Converts anything thrown by axios (or elsewhere) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isCancel(error)) {
    return new ApiError({ message: 'Anfrage abgebrochen', status: null, code: 'CANCELED', cause: error })
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response
      const server = readServerError(data)
      return new ApiError({
        message: server?.message ?? error.message,
        status,
        code: isKnownCode(server?.error) ? server.error : codeFromStatus(status),
        details: data,
        cause: error,
      })
    }
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
    return new ApiError({
      message: error.message,
      status: null,
      code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
      cause: error,
    })
  }

  return new ApiError({
    message: error instanceof Error ? error.message : 'Unbekannter Fehler',
    status: null,
    code: 'UNKNOWN',
    cause: error,
  })
}
