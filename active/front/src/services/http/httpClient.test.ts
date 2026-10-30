import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { ApiError } from '../errors/ApiError'
import { createHttpClient, setUnauthorizedHandler } from './httpClient'
import { sessionStore } from './sessionStorage'

function ok(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

function fail(config: InternalAxiosRequestConfig, status: number, data?: unknown): never {
  const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse
  throw new AxiosError('failed', AxiosError.ERR_BAD_RESPONSE, config, null, response)
}

describe('httpClient', () => {
  beforeEach(() => {
    sessionStore.clear()
    setUnauthorizedHandler(null)
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('sends the X-Citizen-Id header (no bearer token) and converts null to undefined', async () => {
    sessionStore.set({ citizenId: 7, username: 'buerger' })
    const adapter = vi.fn<AxiosAdapter>(async (config) => ok(config, { a: null, b: 1 }))
    const client = createHttpClient('/api')
    const res = await client.get('/x', { adapter })
    expect(adapter.mock.calls[0]![0].headers.get('X-Citizen-Id')).toBe('7')
    expect(adapter.mock.calls[0]![0].headers.get('Authorization')).toBeFalsy()
    expect(res.data).toEqual({ a: undefined, b: 1 })
  })

  it('retries GET on 503 and succeeds', async () => {
    let calls = 0
    const adapter: AxiosAdapter = async (config) => {
      calls++
      return calls < 3 ? fail(config, 503) : ok(config, { done: true })
    }
    const promise = createHttpClient('/api').get('/x', { adapter })
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ data: { done: true } })
    expect(calls).toBe(3)
  })

  it('does not retry POST', async () => {
    let calls = 0
    const adapter: AxiosAdapter = async (config) => {
      calls++
      return fail(config, 503)
    }
    await expect(createHttpClient('/api').post('/x', {}, { adapter })).rejects.toBeInstanceOf(ApiError)
    expect(calls).toBe(1)
  })

  it('omits X-Citizen-Id when logged out', async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => ok(config, {}))
    await createHttpClient('/api').get('/x', { adapter })
    expect(adapter.mock.calls[0]![0].headers.get('X-Citizen-Id')).toBeFalsy()
  })

  it('clears the session and notifies on 401', async () => {
    sessionStore.set({ citizenId: 1, username: 'buerger' })
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    const adapter: AxiosAdapter = async (config) => fail(config, 401)
    await expect(createHttpClient('/api').get('/x', { adapter })).rejects.toMatchObject({ kind: 'unauthorized' })
    expect(sessionStore.get()).toBeNull()
    expect(handler).toHaveBeenCalledOnce()
  })
})
