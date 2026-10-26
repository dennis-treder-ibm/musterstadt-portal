import { ApiError } from '../errors/ApiError'
import { computeBackoff, withRetry } from './retry'

const noWait = () => Promise.resolve()

describe('withRetry', () => {
  it('retries retryable errors and eventually succeeds', async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new ApiError('network', 'down'))
      .mockRejectedValueOnce(new ApiError('server', 'bad gateway', { status: 503 }))
      .mockResolvedValue('ok')

    await expect(withRetry(fn, { retries: 2 }, noWait)).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('does not retry non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError('validation', 'bad', { status: 400 }))
    await expect(withRetry(fn, { retries: 3 }, noWait)).rejects.toBeInstanceOf(ApiError)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('gives up after the configured number of retries', async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError('timeout', 'slow'))
    await expect(withRetry(fn, { retries: 2 }, noWait)).rejects.toMatchObject({ kind: 'timeout' })
    expect(fn).toHaveBeenCalledTimes(3)
  })
})

describe('computeBackoff', () => {
  const opts = { retries: 3, baseDelayMs: 100, maxDelayMs: 500 }
  it('grows exponentially and is capped', () => {
    expect(computeBackoff(0, opts, () => 1)).toBe(100)
    expect(computeBackoff(1, opts, () => 1)).toBe(200)
    expect(computeBackoff(10, opts, () => 1)).toBe(500)
  })
})
