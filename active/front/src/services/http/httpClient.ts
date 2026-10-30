import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { logger } from '@/utils/logger'
import { nullsToUndefined } from '@/utils/transform'
import { toApiError } from '../errors/toApiError'
import { computeBackoff, DEFAULT_RETRY, IDEMPOTENT_METHODS } from './retry'
import { sessionStore } from './sessionStorage'

type RetryableConfig = InternalAxiosRequestConfig & { __retryCount?: number }

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

/** Registers the callback invoked on any 401 response (e.g. logout + redirect to /login). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Creates the configured axios instance. Exported as a factory so tests can
 * build isolated clients; application code should use the shared `httpClient`.
 */
export function createHttpClient(baseURL: string = env.apiBaseUrl): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: env.apiTimeoutMs,
    withCredentials: env.apiWithCredentials,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Marks requests as XHR; also acts as a simple CSRF guard for cookie-based sessions.
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  // --- Request: identify the citizen (stateless backend contract) ---
  client.interceptors.request.use((config) => {
    const session = sessionStore.get()
    if (session) config.headers.set('X-Citizen-Id', String(session.citizenId))
    return config
  })

  // --- Response: transform payload ---
  client.interceptors.response.use((response) => {
    response.data = nullsToUndefined(response.data)
    return response
  })

  // --- Response: retry transient failures, then normalise errors ---
  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    const apiError = toApiError(error)

    if (config && apiError.isRetryable && IDEMPOTENT_METHODS.has((config.method ?? 'get').toLowerCase())) {
      const attempt = config.__retryCount ?? 0
      if (attempt < DEFAULT_RETRY.retries) {
        config.__retryCount = attempt + 1
        const delay = computeBackoff(attempt, DEFAULT_RETRY)
        logger.warn('Retrying request', { url: config.url, method: config.method, attempt: attempt + 1, delay })
        await sleep(delay)
        return client.request(config)
      }
    }

    if (apiError.kind === 'unauthorized') {
      sessionStore.clear()
      onUnauthorized?.()
    }

    if (apiError.kind !== 'canceled') {
      logger.error('API request failed', {
        url: config?.url,
        method: config?.method,
        status: apiError.status,
        kind: apiError.kind,
      })
    }

    throw apiError
  })

  return client
}

export const httpClient = createHttpClient()
