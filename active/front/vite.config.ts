/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Quarkus backend (active/back) listens on 9080 – see application.properties
  const backendTarget = env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:9080'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Quarkus CORS allows http://localhost:5173 (and 3000/4200)
      host: 'localhost',
      port: 5173,
      strictPort: true,
      // Dev proxy: browser calls /api/* on the Vite origin, avoiding CORS preflights
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
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
