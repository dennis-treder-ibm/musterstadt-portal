import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { ApiError } from '../errors/ApiError'
import { createHttpClient, setUnauthorizedHandler } from './httpClient'
import { tokenStorage } from './tokenStorage'

function ok(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

function fail(config: InternalAxiosRequestConfig, status: number, data?: unknown): never {
  const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse
  throw new AxiosError('failed', AxiosError.ERR_BAD_RESPONSE, config, null, response)
}

describe('httpClient', () => {
  beforeEach(() => {
    tokenStorage.clear()
    setUnauthorizedHandler(null)
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('adds the bearer token and converts null to undefined', async () => {
    tokenStorage.set('tkn')
    const adapter = vi.fn<AxiosAdapter>(async (config) => ok(config, { a: null, b: 1 }))
    const client = createHttpClient('/api')
    const res = await client.get('/x', { adapter })
    expect(adapter.mock.calls[0]![0].headers.get('Authorization')).toBe('Bearer tkn')
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

  it('clears token and notifies on 401', async () => {
    tokenStorage.set('tkn')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    const adapter: AxiosAdapter = async (config) => fail(config, 401)
    await expect(createHttpClient('/api').get('/x', { adapter })).rejects.toMatchObject({ kind: 'unauthorized' })
    expect(tokenStorage.get()).toBeNull()
    expect(handler).toHaveBeenCalledOnce()
  })
})
