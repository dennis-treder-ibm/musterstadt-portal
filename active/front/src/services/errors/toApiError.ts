import { AxiosError, isAxiosError, isCancel } from 'axios'
import type { ApiErrorBody, FieldError } from '@/types/api'
import { ApiError, type ApiErrorKind } from './ApiError'

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status >= 500) return 'server'
  return 'unknown'
}

function extractFieldErrors(body: ApiErrorBody | undefined): FieldError[] {
  const raw = body?.errors ?? body?.violations ?? []
  return raw
    .filter((e): e is FieldError => typeof e.field === 'string' && typeof e.message === 'string')
    .map(({ field, message }) => ({ field, message }))
}

/** Converts any thrown value (typically an AxiosError) into an {@link ApiError}. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isCancel(error)) {
    return new ApiError('canceled', 'Request canceled', { cause: error })
  }

  if (isAxiosError<ApiErrorBody>(error)) {
    const { response } = error
    if (!response) {
      const kind = error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT ? 'timeout' : 'network'
      return new ApiError(kind, error.message, { cause: error })
    }
    const body = typeof response.data === 'object' ? response.data : undefined
    return new ApiError(kindFromStatus(response.status), body?.message ?? body?.detail ?? body?.title ?? error.message, {
      status: response.status,
      code: body?.code,
      fieldErrors: extractFieldErrors(body),
      cause: error,
    })
  }

  const message = error instanceof Error ? error.message : 'Unknown error'
  return new ApiError('unknown', message, { cause: error })
}
