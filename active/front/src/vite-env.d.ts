/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Quarkus REST API (default `/api`, proxied by Vite in dev). */
  readonly VITE_API_BASE_URL?: string
  /** Dev/preview proxy target for `/api` (read in vite.config.ts). */
  readonly VITE_API_PROXY_TARGET?: string
  /** Request timeout in milliseconds. */
  readonly VITE_API_TIMEOUT_MS?: string
  /** Send cookies on cross-origin requests (only needed for cookie sessions). */
  readonly VITE_API_WITH_CREDENTIALS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
