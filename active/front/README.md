# Bürgerportal Musterstadt – React Frontend

React 19 + TypeScript (strict) + Material UI single-page application. It replaces the legacy JSF/PrimeFaces UI described in [`../back/architecture.md`](../back/architecture.md) and talks to a stateless REST backend over `/api`.

## Prerequisites

- **Node.js ≥ 20.19** (developed with Node 26, npm 11)
- A REST backend reachable at `http://localhost:9080` (see [Data source](#data-source)). The landing page works without it; login, dashboard and all forms need it.

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
Demo login (seed data of the backend): **`buerger` / `demo-password`**.

## Build and other scripts

| Command | Purpose |
|---|---|
| `npm run build` | Type-check (`tsc -b`) and create the production bundle in `dist/` |
| `npm run preview` | Serve the production build on port **4173** |
| `npm test` | Run unit/component tests once (Vitest + Testing Library) |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | Lint with oxlint |
| `npm run typecheck` | Type-check only |

## Data source

All data comes from the REST API under `/api`. The browser only talks to the Vite dev/preview server, which proxies `/api/**` to the backend (`vite.config.ts`). Requests are therefore same-origin and need **no CORS preflight** in development.

| Variable (`.env.development`) | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL used by the HTTP client |
| `VITE_API_PROXY_TARGET` | `http://localhost:9080` | Backend the dev/preview proxy forwards to |
| `VITE_API_TIMEOUT_MS` | `15000` | Request timeout |
| `VITE_API_WITH_CREDENTIALS` | `false` | Send cookies cross-origin (not needed, the API is stateless) |

Put local overrides in `.env.local` (git-ignored).

> **Backend status:** the current `../back` working tree is the legacy JSF/Liberty monolith (port 9080, context root `/buergerportal`) and exposes **no REST endpoints**. The REST contract below was implemented by the Quarkus backend in git commit `dcbb1c3` (`active/back/src/main/java/com/musterstadt/rest/`, port 9080). Start a backend that provides this contract on the proxy target, or point `VITE_API_PROXY_TARGET` at it. Without it the pages show their German error state with a retry button.

### REST contract used by the frontend

Authentication is stateless: after `POST /api/auth/login` the frontend stores `{ citizenId, username }` in `sessionStorage` (key `bp.session`) and sends an **`X-Citizen-Id`** header on every request (no JWT / `Authorization` header). A `401` clears the session and redirects to `/login`. Errors are expected as `{ error, message }`.

| Method & path | Used by |
|---|---|
| `POST /api/auth/login` `{username,password}` → `{success,message,citizenId,username}` | Login |
| `POST /api/auth/logout` | Header "Abmelden" |
| `GET /api/dashboard/summary` | Startseite (figures, "Letzte Vorgänge") |
| `GET/POST /api/parking/applications`, `GET /api/parking/zones` | Parkausweis |
| `GET /api/parking/applications/{id}/permit`, `PATCH …/status?status=` | service layer (available, no UI yet) |
| `POST /api/address/change`, `GET /api/address/applications` | Adressänderung |
| `GET/POST /api/dogs`, `GET /api/dogs/search?q=`, `PUT /api/dogs/{id}` | Hundeanmeldung |
| `GET /api/citizens/{id}`, `GET /api/citizens/registry?lastName=` | service layer (available, no UI yet) |

**Production / direct cross-origin calls:** set `VITE_API_BASE_URL` to the absolute backend URL and enable CORS on the backend for the portal origin, allowing the `Content-Type` and `X-Citizen-Id` request headers.

## Architecture overview

```
src/
├── config/        typed env access
├── types/         domain model (domain.ts) and API DTOs (dto.ts, api.ts)
├── theme/         MUI theme, ThemeProvider, system/light/dark toggle
├── services/      axios client + interceptors (X-Citizen-Id, 401 handling, retry), ApiError,
│                  session store, BaseService and one service per resource (auth, parking, address, dog, dashboard, citizen)
├── context/       AuthProvider / useAuth (React Context API)
├── hooks/         useApiQuery (loading/error/reload), useForm (validation, submit, backend field errors)
├── router/        route map (paths.ts), routes, guards (RequireAuth, PublicOnly)
├── components/
│   ├── layout/    AppLayout, AppHeader, Sidebar (responsive drawer), AppFooter, navigation
│   └── common/    FormTextField, FormSelect, FormActions, SortablePaginatedTable, StatusChip, StatCard, ServiceCard,
│                  ConfirmDialog, FeedbackSnackbar, InfoNotice, PageHeader, LoadingState, ErrorAlert, ErrorBoundary
├── pages/         Landing, Login, Dashboard, ParkingPermit, AddressChange, DogRegistration, Admin, NotFound
└── utils/         validation (rules from architecture.md §4), formatting (de-DE), transform, logger
```

Key decisions: React Context for state (auth, theme); local component state plus `useApiQuery`/`useForm` for server data and forms (no extra state library); MUI components only (no `@mui/x-*`); centralised `ApiError` → user-friendly German messages; accessibility via skip link, landmarks, labelled tables with sortable headers, `aria-invalid` fields, `role="alert"` errors and keyboard-operable dialogs.

### Routes (navigation rules in `architecture.md` §5.3)

| Path | Page | Access |
|---|---|---|
| `/` | Landing page | public |
| `/login` | Anmeldung | public only |
| `/dashboard` | Startseite: statistics, recent activity, quick links, Hochwasserhilfe notice | authenticated |
| `/parking` | Parkausweis beantragen: form, own applications, zone overview | authenticated |
| `/address` | Adressänderung beantragen: form, own applications | authenticated |
| `/dogs` | Hundeanmeldung: form, search, own dogs (edit dialog), dog-tax info | authenticated |
| `/admin` | Administrationsbereich ("Demnächst verfügbar") | authenticated |

The backend assigns no roles, so every logged-in user is a `CITIZEN`; the `RequireAuth roles={…}` guard remains available for future role-based areas. Route guards are UX only – the backend must enforce authorization.

### Validation (mirrors `architecture.md` §4; the backend stays authoritative)

- Parking: Kennzeichen ≥ 5 characters (stored upper-case/trimmed, max 20), Parkzone required, Nachweis path max 500.
- Address: Straße and Ort required, Postleitzahl 5 digits.
- Dog: Hundename required (max 100), Rasse max 100, Chip-Nummer optional, 15 digits.

### Theme

Three modes – **System** (default, follows `prefers-color-scheme`), **Hell**, **Dunkel** – switchable in the header; the choice is persisted in `localStorage`.
