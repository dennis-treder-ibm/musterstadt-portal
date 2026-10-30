import { isApiError } from '../errors/ApiError'

export interface RetryOptions {
  /** Retries after the first attempt. */
  retries: number
  /** Base delay in ms; grows exponentially (base * 2^attempt) with jitter. */
  baseDelayMs: number
  maxDelayMs: number
}

export const DEFAULT_RETRY: RetryOptions = { retries: 2, baseDelayMs: 300, maxDelayMs: 3_000 }

/** HTTP methods that are safe to retry automatically. */
export const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options', 'put', 'delete'])

export function computeBackoff(attempt: number, { baseDelayMs, maxDelayMs }: RetryOptions, random = Math.random): number {
  const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt)
  return Math.round(exp / 2 + random() * (exp / 2))
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Runs `fn`, retrying transient {@link ApiError}s with exponential backoff.
 * Non-retryable errors are rethrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  wait: (ms: number) => Promise<void> = sleep,
): Promise<T> {
  const opts = { ...DEFAULT_RETRY, ...options }
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt >= opts.retries || !isApiError(error) || !error.isRetryable) throw error
      await wait(computeBackoff(attempt, opts))
    }
  }
}
