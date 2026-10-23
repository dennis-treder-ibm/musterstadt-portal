import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { logger } from '@/utils/logger'
import { loadSession } from '@/services/auth/authSession'
import { toApiError, type ApiError } from './apiError'
import { backoffDelay, isTransientError, resolveRetryOptions, sleep } from './retry'

/** Header the Quarkus resources use to identify the citizen (returned by POST /api/auth/login). */
export const CITIZEN_ID_HEADER = 'X-Citizen-Id'

type UnauthorizedHandler = (error: ApiError) => void
let unauthorizedHandler: UnauthorizedHandler | null = null

/** Registered by AuthProvider: invoked when an authenticated request is rejected with 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

export function createHttpClient(config: AxiosRequestConfig = {}): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeoutMs,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    // Required if the API is called cross-origin with credentials (Quarkus CORS allows credentials).
    withCredentials: true,
    ...config,
  })

  // --- Request: attach the citizen identity ---------------------------------
  client.interceptors.request.use((request) => {
    const session = loadSession()
    if (session) request.headers.set(CITIZEN_ID_HEADER, String(session.citizenId))
    logger.debug(`→ ${request.method?.toUpperCase()} ${request.url}`)
    return request
  })

  // --- Response: retry transient failures, then normalise errors ------------
  client.interceptors.response.use(
    (response) => {
      logger.debug(`← ${response.status} ${response.config.url}`)
      return response
    },
    async (error: unknown) => {
      if (axios.isAxiosError(error) && error.config && isTransientError(error)) {
        const options = resolveRetryOptions(error.config.retry)
        const attempt = (error.config.retryCount ?? 0) + 1
        if (options && attempt <= options.retries) {
          error.config.retryCount = attempt
          logger.warn(`Retrying request (${attempt}/${options.retries})`, { url: error.config.url })
          await sleep(backoffDelay(attempt, options))
          return client.request(error.config)
        }
      }

      const apiError = toApiError(error)
      logger.error(`Request failed: ${apiError.message}`, { status: apiError.status, code: apiError.code })

      const hadSession = loadSession() !== null
      if (apiError.status === 401 && hadSession) unauthorizedHandler?.(apiError)

      return Promise.reject(apiError)
    },
  )

  return client
}

/** Shared client instance used by all API services. */
export const httpClient = createHttpClient()

/** Thin typed helpers returning the response body, so services contain no axios plumbing. */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => httpClient.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    httpClient.post<T>(url, body, config).then((r) => r.data),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    httpClient.put<T>(url, body, config).then((r) => r.data),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    httpClient.patch<T>(url, body, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) => httpClient.delete<T>(url, config).then((r) => r.data),
}
