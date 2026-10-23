import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveSession } from '@/services/auth/authSession'
import { ApiError } from './apiError'
import { CITIZEN_ID_HEADER, createHttpClient, setUnauthorizedHandler } from './httpClient'
import { backoffDelay, DEFAULT_RETRY } from './retry'

function ok(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: 'OK', headers: {}, config }
}

function httpError(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosError {
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', config, null, ok(config, data, status))
}

function clientWith(adapter: AxiosAdapter) {
  return createHttpClient({ adapter, baseURL: '/api' })
}

const fastRetry = { retries: 2, baseDelayMs: 1, maxDelayMs: 2 }

beforeEach(() => setUnauthorizedHandler(null))

describe('httpClient', () => {
  it('attaches X-Citizen-Id when a session exists', async () => {
    saveSession({ citizenId: 7, username: 'buerger' })
    const adapter = vi.fn<AxiosAdapter>(async (config) => ok(config, { fine: true }))

    await clientWith(adapter).get('/dashboard/summary')

    const sent = adapter.mock.calls[0]?.[0]
    expect(sent?.headers.get(CITIZEN_ID_HEADER)).toBe('7')
  })

  it('omits X-Citizen-Id without a session', async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => ok(config, {}))
    await clientWith(adapter).get('/parking/zones')
    expect(adapter.mock.calls[0]?.[0].headers.has(CITIZEN_ID_HEADER)).toBe(false)
  })

  it('normalises backend error bodies into ApiError', async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw httpError(config, 400, { error: 'VALIDATION_ERROR', message: 'Postleitzahl ungültig' })
    }

    await expect(clientWith(adapter).post('/address/change', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Postleitzahl ungültig',
    })
  })

  it('retries transient GET failures and then succeeds', async () => {
    let calls = 0
    const adapter: AxiosAdapter = async (config) => {
      calls += 1
      if (calls < 3) throw httpError(config, 503, {})
      return ok(config, { value: 1 })
    }

    const response = await clientWith(adapter).get('/dogs', { retry: fastRetry })
    expect(response.data).toEqual({ value: 1 })
    expect(calls).toBe(3)
  })

  it('does not retry POST requests', async () => {
    let calls = 0
    const adapter: AxiosAdapter = async (config) => {
      calls += 1
      throw httpError(config, 503, {})
    }

    await expect(clientWith(adapter).post('/parking/applications', {}, { retry: fastRetry })).rejects.toBeInstanceOf(
      ApiError,
    )
    expect(calls).toBe(1)
  })

  it('does not retry client errors', async () => {
    let calls = 0
    const adapter: AxiosAdapter = async (config) => {
      calls += 1
      throw httpError(config, 404, { error: 'NOT_FOUND', message: 'weg' })
    }

    await expect(clientWith(adapter).get('/x', { retry: fastRetry })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(calls).toBe(1)
  })

  it('notifies the unauthorized handler on 401 only when a session exists', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    const adapter: AxiosAdapter = async (config) => {
      throw httpError(config, 401, { error: 'UNAUTHORIZED', message: 'nope' })
    }
    const client = clientWith(adapter)

    await expect(client.get('/dogs', { retry: false })).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()

    saveSession({ citizenId: 1, username: 'buerger' })
    await expect(client.get('/dogs', { retry: false })).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('flags network failures', async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    const error = await clientWith(adapter)
      .post('/auth/login', {}, { retry: false })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).isNetworkError).toBe(true)
    expect((error as ApiError).code).toBe('NETWORK_ERROR')
  })
})

describe('backoffDelay', () => {
  it('grows exponentially and is capped', () => {
    const opts = { ...DEFAULT_RETRY, baseDelayMs: 100, maxDelayMs: 250 }
    expect(backoffDelay(1, opts)).toBeLessThanOrEqual(100)
    expect(backoffDelay(5, opts)).toBeLessThanOrEqual(250)
    expect(backoffDelay(5, opts)).toBeGreaterThanOrEqual(125)
  })
})
