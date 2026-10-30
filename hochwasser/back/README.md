# Bürgerportal Musterstadt

> **Demo asset** — a deliberately legacy German municipal citizen portal for Java modernisation workshops.
> It is meant to look and feel like it evolved organically over 15+ years.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Java | 8 (must be on `PATH` as `java`) |
| Maven | 3.6+ |
| Internet access | Required on first build to download Liberty, PrimeFaces, Hibernate |

No application server installation needed — the Liberty Maven plugin downloads and manages the runtime automatically.

---

## Running the Application

```bash
mvn liberty:run
```

Open Liberty downloads on first run (~30 seconds). Once you see:

```
[INFO] [AUDIT   ] CWWKF0011I: The defaultServer server is ready to run a smarter planet.
```

Navigate to: **http://localhost:9080/buergerportal**

---

## Default Login

| Field | Value |
|---|---|
| Benutzername | `buerger` |
| Kennwort | `demo-password` |

---

## Building a WAR (without running)

```bash
mvn package
```

Produces `target/buergerportal.war`.

---

## Running Tests

```bash
mvn test
```

5 unit tests covering `AddressChangeService.validatePostcode()` and `ParkingPermitBean` field validation.
Approximately 22% line coverage — deliberately sparse.

---

## Services Overview

### 1. Startseite (Dashboard)
Summary statistics for all services: parking permit count, dog registration count, open/approved/rejected applications.
Recent activity table with `dd.MM.yyyy` formatted dates.

### 2. Parkausweis (Parking Permit)
Citizens can apply for a parking permit by entering a vehicle registration and selecting a zone.
All existing applications are displayed in a table.
**Session-scoped bean** — opening two tabs causes state bleed (intentional demo problem).

### 3. Adressänderung (Address Change)
Citizens can submit an address change request.
The postcode validator only checks `length == 5` — non-numeric strings like `ABCDE` pass (intentional bug).

### 4. Hundeanmeldung (Dog Registration)
Citizens register their dog with name, breed, and chip number.
Uses a PrimeFaces `<p:dataTable>` with server-side pagination and sort.
Free-text search across dog name and breed.

### 5. Hochwasserhilfe (Flood Assistance)
Navigation item is disabled with `"Demnächst verfügbar"` — feature was never implemented.

---

## Deliberate Problems Catalogue

These problems are **intentional** — they make the modernisation story land clearly.

### Accessibility
- No ARIA labels on any form fields
- No skip-to-content link
- Error messages use inline `style="color:red"` with no `role="alert"`
- Images have no `alt` text (logo in header)
- Focus styles suppressed in CSS (commented-out `*:focus { outline: none }`)
- Poor colour contrast: `#999999` text on white (#aaaaaa on white = 1.8:1, fails WCAG AA)
- `<html lang="de">` present but no aria-live regions

### Mobile / Responsive
- Fixed 960px width — completely broken below 1024px viewport
- No media queries anywhere in `portal.css`
- Table-based layout throughout

### Architecture
- `@ManagedBean` (legacy JSF) instead of CDI `@Named`
- `ParkingPermitBean` is `@SessionScoped` — state bleeds across browser tabs
- Business logic duplicated in both beans and services (postcode validation in both `AddressChangeBean` and `AddressChangeService`)
- DAOs injected with `@EJB` (not CDI `@Inject`)
- Dead commented-out code in `AddressChangeService.submitChange()`

### Integration
- `CitizenRegistryService` simulates a legacy SOAP call with 200ms artificial latency
- SOAP endpoint `http://registry.musterstadt.de/ws/citizen` was decommissioned in 2019
- No REST replacement was ever built
- WARN log: `"Calling legacy SOAP endpoint"` visible in Liberty console on every lookup

### Testing
- Only 22% line coverage
- JUnit 4 (not 5)
- No mocking framework
- No integration tests, no UI tests
- `ParkingPermitBeanTest` cannot fully test `submitApplication()` because `@EJB` fields are null

### Code Quality
- JPQL strings hard-coded inline (no named queries)
- No pagination on DAO `findAll()` methods
- `getApplicationsByPostcode()` in `ParkingPermitService` fetches all parking apps ignoring the postcode filter
- `DashboardBean` loads fresh from DB on every request (no cache)

---

## Demo Talking Points

### Opening — "What does the portal do?"
Walk through the dashboard and the four services. Point out the table-based layout, fixed width, and early-2000s visual.

### Talking point 1 — Accessibility
Open browser DevTools → Accessibility tab. Show zero ARIA labels. Point at the login error message: `style="color:red"` with no `role="alert"`. Screen reader demo would hear nothing.

### Talking point 2 — Session scope bug
Open the Parkausweis page. Open a second tab to the same page. Fill in a vehicle registration in tab 1. Switch to tab 2 — the field value has appeared. *That's `@SessionScoped` sharing one bean instance across all tabs for the same user.*

### Talking point 3 — Legacy SOAP stub
Tail the Liberty log while navigating to any page that triggers `CitizenRegistryService.lookupCitizen()`. Show the `[WARNING] Calling legacy SOAP endpoint` line. Point out the 200ms simulated latency and the TODO comment pointing at a 2019 Jira ticket that was never resolved.

### Talking point 4 — Postcode validation bug
On the Adressänderung page, enter `ABCDE` as the postcode and submit. The form accepts it. Open `AddressChangeService.java` line ~63 and show `postcode.length() == 5` — accepts any 5-character string.

### Talking point 5 — No mobile
Drag the browser window to 600px wide. The portal is completely unusable. There are zero media queries. This is the norm for government portals built before 2015.

### Talking point 6 — Technical debt visibility
Open `TECHNICAL_DEBT.md`. Walk through the TODO list — 8+ scattered across 6 files. Each one represents a modernisation work item. The AMA assessment will surface all of these automatically from static analysis.

---

## Architecture Diagram (logical)

```
Browser (IE11 / Chrome / Firefox)
       │  HTTP
       ▼
Open Liberty 23.x (webProfile-8.0)
├── JSF 2.2 (Faces Servlet → *.xhtml)
│   └── PrimeFaces 6.2
├── CDI 2.0 (not used — beans use @ManagedBean)
├── EJB 3.2 (@Stateless DAOs + Services + @Singleton DataInitializer)
│   └── JPA 2.2 (Hibernate 5.6 provider)
│       └── H2 in-memory (jdbc:h2:mem:buergerportal)
└── Servlet 4.0 (via feature webProfile-8.0)
```

---

*This demo asset was generated as part of the IBM Java Modernisation pre-sales workshop toolkit.*
