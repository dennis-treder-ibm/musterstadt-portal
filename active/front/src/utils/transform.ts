/** Converts blank strings to undefined so optional fields are omitted from request bodies. */
export function emptyToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Trims all string values of a flat form object and drops blank optional values. */
export function cleanPayload<T extends Record<string, string | undefined>>(form: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key of Object.keys(form) as (keyof T)[]) {
    const value = emptyToUndefined(form[key])
    if (value !== undefined) result[key] = value as T[keyof T]
  }
  return result
}

/** Groups items by a key – used e.g. to split applications by status. */
export function groupBy<T, K extends string>(items: readonly T[], keyOf: (item: T) => K): Record<K, T[]> {
  const groups = {} as Record<K, T[]>
  for (const item of items) {
    const key = keyOf(item)
    ;(groups[key] ??= []).push(item)
  }
  return groups
}
