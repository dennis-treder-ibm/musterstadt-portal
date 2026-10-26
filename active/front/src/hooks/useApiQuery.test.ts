import { act, renderHook, waitFor } from '@testing-library/react'
import { ApiError } from '@/services'
import { useApiQuery } from './useApiQuery'

describe('useApiQuery', () => {
  it('loads data and exposes loading state', async () => {
    const fetcher = vi.fn().mockResolvedValue(['a'])
    const { result } = renderHook(() => useApiQuery(fetcher))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(['a'])
    expect(result.current.error).toBeNull()
  })

  it('exposes a user-facing error message', async () => {
    const fetcher = vi.fn().mockRejectedValue(new ApiError('server', 'boom', { status: 500 }))
    const { result } = renderHook(() => useApiQuery(fetcher))
    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).not.toContain('boom')
  })

  it('reloads on demand and when the key changes', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockResolvedValueOnce(3)
    const { result, rerender } = renderHook(({ k }) => useApiQuery(fetcher, k), { initialProps: { k: 'a' } })
    await waitFor(() => expect(result.current.data).toBe(1))

    act(() => result.current.reload())
    await waitFor(() => expect(result.current.data).toBe(2))

    rerender({ k: 'b' })
    await waitFor(() => expect(result.current.data).toBe(3))
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
})
