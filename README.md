# Gov Portal Modernisation — UI Modernisation Demo

This repository demonstrates the UI modernisation of **Bürgerportal Musterstadt**, a fictional German municipal citizen portal. The portal started life as a Java EE 8 monolith — JSF Facelets, PrimeFaces, EJB backing beans, table-based layout, no responsive design — and ends up as a decoupled React SPA with a Quarkus REST backend.

The repository is structured into three folders, each serving a distinct role.

---

## Folder overview

```
.
├── base/        # The legacy monolith — your starting point
├── finished/    # The completed modernisation — React + Quarkus
└── active/      # Your working copy — where you do the modernisation live
```

---

## `base/` — the legacy monolith

This is the **deliberately problematic** starting point. It's a single Maven WAR project running on Open Liberty with JSF 2.2, PrimeFaces 6.2, and EJB 3.x. It provides four citizen services (parking permit, address change, dog registration, and a dashboard), along with a dead SOAP integration stub that never got migrated to REST.

**Technology stack:**

| Layer | Technology |
|---|---|
| Runtime | Open Liberty 23.x (`webProfile-8.0`) |
| Presentation | JSF 2.2 + PrimeFaces 6.2 (`.xhtml` Facelets) |
| Business logic | EJB 3.x `@Stateless` session beans |
| Persistence | JPA 2.2 / Hibernate 5.6 + H2 in-memory |
| Java | Java 8 |
| Build | Maven 3 + `liberty-maven-plugin` |

To run it:

```bash
cd base
mvn liberty:run
```

Then open `http://localhost:9080/buergerportal` and log in with `buerger` / `demo-password`.

### What's wrong with it (intentionally)

The codebase contains a catalogue of real-world legacy problems — the kind of thing you'd actually find in a government portal that evolved over 15 years:

- **No accessibility.** Zero ARIA labels, error messages with `style="color:red"` and no `role="alert"`, suppressed focus outlines, poor colour contrast (1.8:1 ratio, fails WCAG AA).
- **Not responsive.** Fixed 960px width, table-based layout throughout, zero media queries. Completely broken below 1024px.
- **Session scope bug.** `ParkingPermitBean` is `@SessionScoped`, so opening two tabs causes form state to bleed between them.
- **Broken validation.** The postcode validator checks `length == 5` but not that the characters are digits — `ABCDE` passes.
- **Dead SOAP integration.** `CitizenRegistryService` simulates a call to an endpoint decommissioned in 2019. It adds 200ms artificial latency and logs a warning on every request.
- **Duplicated business logic.** Validation rules are copied between backing beans and service classes.
- **22% test coverage.** JUnit 4, no mocking, no integration tests. Some tests can't even exercise the method under test because `@EJB` fields are null.

These aren't accidents — they're the points you demonstrate before showing what the modernisation fixes.

---

## `finished/` — the completed modernisation

This is the **target state**: a decoupled, two-tier application. The JSF monolith has been split into a React SPA talking to a Quarkus REST API over JSON.

```
finished/
├── back/    # Quarkus 3.8 REST API (Java 11)
└── front/   # React 19 SPA (TypeScript, Vite, Carbon Design System)
```

**Backend (`finished/back/`):**

| Layer | Technology |
|---|---|
| Runtime | Quarkus 3.8 |
| API | JAX-RS (RESTEasy Reactive) + Jackson |
| Persistence | JPA / Hibernate ORM + H2 in-memory |
| API docs | SmallRye OpenAPI (Swagger UI at `/q/swagger-ui`) |
| Java | Java 11 |
| Build | Maven 3 + `quarkus-maven-plugin` |
| Tests | JUnit 5 + REST-Assured |

The EJB container, JSF, and PrimeFaces are gone. Services are plain CDI beans. The legacy SOAP stub is removed. The same four citizen services are exposed as REST endpoints.

**Frontend (`finished/front/`):**

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| UI library | IBM Carbon Design System (`@carbon/react`) |
| HTTP | Axios |
| Routing | React Router v7 |
| Linting | Oxlint |

The table-based layout is replaced by Carbon's responsive grid. Accessibility is handled by Carbon components out of the box. There's no session-scoped state bleed — auth is handled properly client-side.

To start both processes together:

```bash
cd finished
./start.sh
```

This starts the Quarkus backend on `http://localhost:8080` and the Vite dev server on `http://localhost:5173`. Ctrl-C stops both. You'll need Java 11+, Maven, Node, and npm on your `PATH`.

### What changed

| Problem in `base/` | Fix in `finished/` |
|---|---|
| JSF `@SessionScoped` bean — state bleeds between tabs | Stateless REST API; client owns its own state |
| Table-based fixed 960px layout | Carbon responsive grid, works at any viewport |
| No ARIA, no accessible error messages | Carbon form components with built-in ARIA support |
| Postcode validation accepts `ABCDE` | Proper `\d{5}` regex validation |
| Dead SOAP stub with 200ms latency on every request | Removed entirely |
| JUnit 4, 22% coverage, no mocks | JUnit 5, REST-Assured integration tests |
| EJB `@ManagedBean` anti-patterns | CDI beans throughout |
| Duplicated validation logic | Validation in one place per rule |

---

## `active/` — your live working copy

This is where the modernisation happens in front of an audience. It starts as a copy of `finished/` (same split structure with `back/` and `front/`) so you've got the scaffolding in place, but the intent is to demonstrate individual modernisation steps here rather than just showing the before and after.

```
active/
├── back/    # Quarkus backend — same as finished/back to start
└── front/   # React frontend — same as finished/front to start
```

Use this folder when you're walking through the modernisation live. Make changes here, show the effect, then refer back to `base/` and `finished/` as reference points. Start both services the same way:

```bash
cd active
./start.sh
```

> The `active/` folder is intentionally a work-in-progress space. Don't expect it to be in a clean state — that's the point.

---

## Running the e2e tests

Both `base/` and `active/back/` (and `finished/back/`) include a Playwright e2e test suite in their respective `e2e/` directories. These cover login, parking permit submission, address change, and dog registration.

```bash
# from base/e2e or finished/back/e2e or active/back/e2e
npm install
npx playwright test
```

Make sure the backend is running before you start the tests.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Java | 8 (for `base/`), 11 (for `finished/` and `active/`) |
| Maven | 3.8.8+ |
| Node | 18+ |
| npm | 9+ |

No application server installation needed — Liberty and Quarkus both manage their own runtime via Maven plugins.
