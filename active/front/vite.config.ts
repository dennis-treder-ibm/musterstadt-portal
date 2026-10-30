/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // REST backend port (the Quarkus service used 9080; see README). Override with VITE_API_PROXY_TARGET.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:9080'

  // The browser calls Vite (same-origin) and Vite forwards to the backend. Drop the browser's
  // `Origin` header so the backend's CORS filter does not reject it (e.g. 127.0.0.1 vs localhost → 403).
  const apiProxy = {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
    configure: (proxy: { on: (event: 'proxyReq', cb: (req: { removeHeader: (name: string) => void }) => void) => void }) => {
      proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
    },
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/, priority: 20 },
              { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      // Same-origin proxy: the browser talks to Vite, Vite forwards /api to Quarkus,
      // so no CORS preflight is needed during development.
      proxy: {
        '/api': apiProxy,
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      proxy: {
        '/api': apiProxy,
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})
