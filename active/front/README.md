# Bürgerportal Musterstadt – React Frontend

React 19 + TypeScript (strict) + Material UI single-page application. It replaces the legacy JSF/PrimeFaces UI described in [`../back/architecture.md`](../back/architecture.md) and talks to the Quarkus backend in [`../back`](../back) over REST.

## Prerequisites

- **Node.js ≥ 20.19** (developed with Node 26, npm 11)
- The Quarkus backend running locally (default `http://localhost:8080`) for API calls. The landing page works without it.

## Install

```bash
cd "/Users/dennistreder-tschechlov/Documents/IBM Vault/04 Workspace/Umweltministerium-Bob-Demo/musterstadt-portal/active/front"
npm install
```

## Run (development)

```bash
cd "/Users/dennistreder-tschechlov/Documents/IBM Vault/04 Workspace/Umweltministerium-Bob-Demo/musterstadt-portal/active/front" && npm run dev
```

The dev server listens on **port 5173** → <http://127.0.0.1:5173/> (`strictPort` is enabled, so it fails instead of silently switching ports).

## Other scripts

| Command | Purpose |
|---|---|
| `npm run build` | Type-check (`tsc -b`) and create the production bundle in `dist/` |
| `npm run preview` | Serve the production build on port **4173** |
| `npm test` | Run unit/component tests once (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | Lint with oxlint |
| `npm run typecheck` | Type-check only |

## Backend URL, proxy and CORS

The browser only talks to the Vite dev server. Requests to `/api/**` are proxied to the backend (`vite.config.ts`), so they are same-origin and need **no CORS preflight** in development.

| Variable (`.env.development`) | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL used by the HTTP client |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | Quarkus backend (`../back`) the dev/preview proxy forwards to |
| `VITE_API_TIMEOUT_MS` | `15000` | Request timeout |
| `VITE_API_WITH_CREDENTIALS` | `false` | Send cookies cross-origin (only for cookie sessions) |

Put local overrides in `.env.local` (git-ignored). Note: the legacy Liberty app used port 9080 with context root `/buergerportal`; the new Quarkus service is assumed to use its default port 8080 – adjust `VITE_API_PROXY_TARGET` if it differs.

**Production / direct cross-origin calls:** set `VITE_API_BASE_URL` to the absolute backend URL and enable CORS in Quarkus (`application.properties`):

```properties
quarkus.http.cors.enabled=true
quarkus.http.cors.origins=https://portal.musterstadt.example
quarkus.http.cors.methods=GET,POST,PUT,DELETE,OPTIONS
quarkus.http.cors.headers=Authorization,Content-Type,Accept,X-Requested-With
quarkus.http.cors.access-control-allow-credentials=true
```

## Architecture overview

```
src/
├── config/        typed env access
├── types/         domain model (Citizen, Application, …) and API types
├── theme/         MUI theme, ThemeProvider, system/light/dark toggle
├── services/      HTTP layer (axios client, interceptors, retry, ApiError, token storage, BaseService, authService)
├── context/       AuthProvider / useAuth (React Context API)
├── router/        route map (paths.ts), routes, guards (RequireAuth, PublicOnly)
├── components/    layout/ (AppLayout) and common/ (ErrorBoundary)
├── pages/         Landing, Login, NotFound, Placeholder (feature pages come next)
└── utils/         validation (rules from architecture.md §4), formatting (de-DE), transform, logger
```

Key decisions: React Context for state (auth, theme), React Router data router, axios with Bearer-JWT interceptor, retry with exponential backoff for idempotent requests on network errors/502/503/504, centralised `ApiError` → user-friendly German messages, `ErrorBoundary` per route area.

### Routes (from the navigation rules in `architecture.md` §5.3)

| Path | Page | Access |
|---|---|---|
| `/` | Landing page | public |
| `/login` | Anmeldung | public only |
| `/dashboard` | Startseite (placeholder) | authenticated |
| `/parking` | Parkausweis beantragen (placeholder) | authenticated |
| `/address` | Adressänderung melden (placeholder) | authenticated |
| `/dogs` | Hund anmelden (placeholder) | authenticated |
| `/admin` | Verwaltung (placeholder) | role `ADMIN` |

### Theme

Three modes – **System** (default, follows `prefers-color-scheme`), **Hell**, **Dunkel** – switchable in the header; the choice is persisted in `localStorage`.

### Auth assumptions

The backend contract is not implemented yet. The client expects `POST /api/auth/login` → `{ accessToken, citizenId, displayName?, roles? }` and `POST /api/auth/logout`, with the JWT sent as `Authorization: Bearer …`. Route guards are UX only; the backend must enforce authorization.
