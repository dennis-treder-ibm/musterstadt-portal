export const env = {
  /** Base URL for all REST calls. Backend resources live under /api (Quarkus). */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  /** Request timeout in milliseconds. */
  apiTimeoutMs: 15_000,
  isDev: import.meta.env.DEV,
} as const
