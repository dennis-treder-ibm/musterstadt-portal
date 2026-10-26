const DEFAULT_TIMEOUT_MS = 15_000

function parseTimeout(value: string | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS
}

/** Typed, centralised access to build-time environment configuration. */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  apiTimeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
  apiWithCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
  isDev: import.meta.env.DEV,
} as const
