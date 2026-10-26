import type { FieldError } from '@/types/api'

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'canceled'
  | 'unknown'

/** Normalised error thrown by the service layer for every failed HTTP call. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly code?: string
  readonly fieldErrors: FieldError[]

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; code?: string; fieldErrors?: FieldError[]; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = options.status
    this.code = options.code
    this.fieldErrors = options.fieldErrors ?? []
  }

  /** Transient failures worth retrying (network issues, timeouts, 502/503/504). */
  get isRetryable(): boolean {
    return (
      this.kind === 'network' ||
      this.kind === 'timeout' ||
      this.status === 502 ||
      this.status === 503 ||
      this.status === 504
    )
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
