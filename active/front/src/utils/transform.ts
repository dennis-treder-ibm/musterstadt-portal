/**
 * Data transformation helpers shared by the service layer and UI.
 */

/** Recursively replaces `null` with `undefined` so optional TS fields behave as declared. */
export function nullsToUndefined<T>(value: T): T {
  if (value === null) return undefined as T
  if (Array.isArray(value)) return value.map(nullsToUndefined) as T
  if (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, nullsToUndefined(v)]),
    ) as T
  }
  return value
}

/** Trims strings and drops empty optional strings before sending a payload to the API. */
export function cleanPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const entries = Object.entries(payload)
    .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v] as const)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
  return Object.fromEntries(entries) as Partial<T>
}

/** Builds a query string, skipping undefined/null/empty values. */
export function toQueryParams(params: Record<string, string | number | boolean | undefined | null>): URLSearchParams {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  return search
}
