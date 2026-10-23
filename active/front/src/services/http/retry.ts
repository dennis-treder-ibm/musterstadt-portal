import type { AxiosError } from 'axios'

export interface RetryOptions {
  /** Maximum number of retries after the first attempt. */
  retries: number
  baseDelayMs: number
  maxDelayMs: number
}

export const DEFAULT_RETRY: RetryOptions = { retries: 2, baseDelayMs: 300, maxDelayMs: 3_000 }

/** Only idempotent methods are retried – a repeated POST could create duplicate applications. */
const IDEMPOTENT_METHODS = ['get', 'head', 'options', 'put', 'delete']
const TRANSIENT_STATUSES = [408, 429, 502, 503, 504]

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Per-request retry override; `false` disables retrying. */
    retry?: Partial<RetryOptions> | false
    /** Internal retry counter. */
    retryCount?: number
  }
}

export function resolveRetryOptions(retry: Partial<RetryOptions> | false | undefined): RetryOptions | null {
  return retry === false ? null : { ...DEFAULT_RETRY, ...retry }
}

/** True for network failures, timeouts and transient gateway/server statuses on idempotent requests. */
export function isTransientError(error: AxiosError): boolean {
  const method = (error.config?.method ?? 'get').toLowerCase()
  if (!IDEMPOTENT_METHODS.includes(method)) return false
  if (!error.response) return error.code !== 'ERR_CANCELED'
  return TRANSIENT_STATUSES.includes(error.response.status)
}

/** Exponential backoff with jitter, capped at maxDelayMs. */
export function backoffDelay(attempt: number, { baseDelayMs, maxDelayMs }: RetryOptions): number {
  const exponential = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
  return Math.round(exponential * (0.5 + Math.random() * 0.5))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
