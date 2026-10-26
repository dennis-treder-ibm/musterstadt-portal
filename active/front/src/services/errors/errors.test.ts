import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ApiError } from './ApiError'
import { toApiError } from './toApiError'
import { getFieldErrorMap, getUserMessage } from './userMessages'

function axiosError(status: number, data?: unknown): AxiosError {
  const config = { headers: {} } as InternalAxiosRequestConfig
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse
  return new AxiosError('failed', AxiosError.ERR_BAD_REQUEST, config, null, response)
}

describe('toApiError', () => {
  it('maps HTTP status codes to kinds', () => {
    expect(toApiError(axiosError(401)).kind).toBe('unauthorized')
    expect(toApiError(axiosError(403)).kind).toBe('forbidden')
    expect(toApiError(axiosError(404)).kind).toBe('not_found')
    expect(toApiError(axiosError(400)).kind).toBe('validation')
    expect(toApiError(axiosError(500)).kind).toBe('server')
  })

  it('extracts backend message, code and field errors (both contracts)', () => {
    const custom = toApiError(axiosError(400, { message: 'Ungültig', code: 'E1', errors: [{ field: 'zone', message: 'Pflicht' }] }))
    expect(custom).toMatchObject({ message: 'Ungültig', code: 'E1', fieldErrors: [{ field: 'zone', message: 'Pflicht' }] })

    const quarkus = toApiError(axiosError(400, { title: 'Constraint Violation', violations: [{ field: 'name', message: 'leer' }] }))
    expect(quarkus.fieldErrors).toEqual([{ field: 'name', message: 'leer' }])
  })

  it('detects network errors and timeouts', () => {
    expect(toApiError(new AxiosError('Network Error', AxiosError.ERR_NETWORK)).kind).toBe('network')
    expect(toApiError(new AxiosError('timeout', AxiosError.ECONNABORTED)).kind).toBe('timeout')
  })

  it('wraps unknown errors and is idempotent', () => {
    const wrapped = toApiError(new Error('boom'))
    expect(wrapped.kind).toBe('unknown')
    expect(toApiError(wrapped)).toBe(wrapped)
  })
})

describe('ApiError.isRetryable', () => {
  it('is true for network/timeout/502-504 only', () => {
    expect(new ApiError('network', 'x').isRetryable).toBe(true)
    expect(new ApiError('server', 'x', { status: 503 }).isRetryable).toBe(true)
    expect(new ApiError('server', 'x', { status: 500 }).isRetryable).toBe(false)
    expect(new ApiError('validation', 'x', { status: 400 }).isRetryable).toBe(false)
  })
})

describe('user messages', () => {
  it('never leaks technical messages', () => {
    expect(getUserMessage(new ApiError('server', 'NullPointerException at X', { status: 500 }))).not.toContain('NullPointer')
    expect(getUserMessage(new Error('secret'))).not.toContain('secret')
  })

  it('prefers first field error for validation errors', () => {
    const err = new ApiError('validation', 'x', { fieldErrors: [{ field: 'a', message: 'Feld a fehlt' }] })
    expect(getUserMessage(err)).toBe('Feld a fehlt')
    expect(getFieldErrorMap(err)).toEqual({ a: 'Feld a fehlt' })
  })
})
