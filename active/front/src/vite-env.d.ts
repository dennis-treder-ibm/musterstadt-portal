/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API. "/api" uses the Vite dev proxy. */
  readonly VITE_API_BASE_URL?: string
  /** Target of the Vite dev proxy (Quarkus backend). */
  readonly VITE_DEV_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
