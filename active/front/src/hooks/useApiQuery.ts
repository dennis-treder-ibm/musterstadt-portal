import { useCallback, useEffect, useRef, useState } from 'react'
import { getUserMessage } from '@/services'

export interface UseApiQueryResult<T> {
  data: T | undefined
  loading: boolean
  /** User-facing (German) message, never technical details. */
  error: string | null
  reload: () => void
}

interface QueryResult<T> {
  requestKey: string
  data: T | undefined
  error: string | null
}

/**
 * Runs `fetcher` on mount and whenever `reload` is called or `key` changes.
 * Ignores results of superseded or unmounted requests; previous data stays visible while reloading.
 */
export function useApiQuery<T>(fetcher: () => Promise<T>, key = ''): UseApiQueryResult<T> {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<QueryResult<T> | null>(null)
  const fetcherRef = useRef(fetcher)
  const requestKey = `${key}#${version}`

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let active = true
    fetcherRef.current().then(
      (data) => {
        if (active) setResult({ requestKey, data, error: null })
      },
      (err: unknown) => {
        if (active) setResult((prev) => ({ requestKey, data: prev?.data, error: getUserMessage(err) }))
      },
    )
    return () => {
      active = false
    }
  }, [requestKey])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const settled = result?.requestKey === requestKey
  return {
    data: result?.data,
    loading: !settled,
    error: settled ? result.error : null,
    reload,
  }
}
