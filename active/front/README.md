# Bürgerportal Musterstadt – Frontend

React 19 + TypeScript (strict) + Material UI 9, built with Vite. Replaces the legacy JSF portal and talks to the Quarkus backend (`../back`, port 9080).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 (proxies `/api` to `http://localhost:9080`) |
| `npm run build` | Type-check and production build |
| `npm run lint` | oxlint |
| `npm test` | Vitest unit tests |

## Structure

- `src/theme` – MUI theme, system/light/dark modes (default: system)
- `src/services/http` – axios client (auth header, retry, error normalisation)
- `src/services/auth` – session storage and login/logout API
- `src/context` – auth and notification state (Context API)
- `src/routes` – route table, paths, guards (`ProtectedRoute`, `PublicOnlyRoute`)
- `src/components`, `src/pages` – UI building blocks and pages
- `src/utils`, `src/types`, `src/config` – helpers, API/domain types, env access

## Configuration

Copy `.env.example` to `.env.local` to override `VITE_API_BASE_URL` (default `/api`, handled by the dev proxy).
Demo login: `buerger` / `demo-password`.
