# Bürgerportal Musterstadt — Architecture Documentation

---

## 1. Executive Summary

**Bürgerportal Musterstadt** ("Citizen Portal of the Model City") is a German municipal e-government web application that allows registered citizens to submit administrative requests online. It replaces in-person visits to the Stadtverwaltung (city administration) for three core services: parking permit applications, address-change notifications, and dog registrations.

The application is a Java EE 8 monolith deployed as a WAR to **IBM WebSphere Liberty**. The presentation layer uses **JSF 2.2 (JavaServer Faces)** with Facelets templates and a small amount of **PrimeFaces 6.2** for the dog-registration data table. There is no Struts involvement; the framework is JSF throughout. Business logic sits in **EJB 3.x Stateless Session Beans** (services and DAOs), and data is persisted via **JPA 2.2 / Hibernate 5.6** against an **H2 in-memory database**.

The codebase exhibits a number of intentional legacy anti-patterns (noted in code comments as deliberate problems for a modernisation scenario): inline validation duplicated between beans and services, session-scoped beans causing multi-tab state bleed, fully table-based HTML layouts with no responsive design, no ARIA accessibility, and a dead SOAP integration stub that was never migrated to REST.

---

## 2. Functional Overview

The application models a citizen's self-service interaction with the city authority. A single demo account (`buerger` / `demo-password`) represents one citizen (ID=1, Hans Müller) in the seeded dataset.

| Feature | Description |
|---|---|
| **Login / Logout** | Session-scoped credential check; single hardcoded username/password pair |
| **Dashboard** | Aggregated statistics (permit counts, application statuses) plus a recent-activity feed |
| **Parking Permit Application** | Submit a vehicle permit request for one of four predefined zones |
| **Address Change Notification** | Notify the Einwohnermeldeamt of a new residential address |
| **Dog Registration** | Register a dog with name, breed, and microchip number; search existing registrations |
| **Flood Assistance** (stub) | Navigation item present but feature not implemented |

A legacy **CitizenRegistryService** stub simulates a SOAP call to an external citizen registry (`registry.musterstadt.de`) that was decommissioned in 2019 and never replaced with the planned REST equivalent.

---

## 3. High-Level Functional Flows

### 3.1 Login Flow

```
citizen opens /buergerportal/login.xhtml
  → enters username + password
  → loginBean.login() validates against hardcoded credentials
    ├── success → session attributes set (loggedIn, loggedInUser, citizenId)
    │            → navigate to /dashboard.xhtml
    └── failure → errorMessage rendered on login page
```

### 3.2 Dashboard Flow

```
/dashboard.xhtml loaded (RequestScoped DashboardBean)
  → dashboardBean reads parkingPermitDao, dogRegistrationDao, applicationDao
    via EJB injections scoped to the logged-in citizenId
  → renders statistics table + recent 10 applications
  → quick-link tiles navigate to the three service pages
```

### 3.3 Parking Permit Application Flow

```
citizen opens /parking/parkingPermit.xhtml (SessionScoped ParkingPermitBean)
  → selects zone from dropdown (loaded from hardcoded list)
  → enters vehicle registration (≥ 5 chars) and optional document path
  → submit → ParkingPermitBean.submitApplication()
    → inline validation (min-length, zone required)
    → ParkingPermitService.createApplication()
      → validates again (duplicated logic)
      → creates APPLICATION record (PENDING)
      → creates PARKING_PERMIT record
      → returns Application entity
    ├── success → successMessage + outcome "parkingSuccess" (stays on same page)
    └── error   → FacesMessage + errorMessage
  → page shows citizen's own PARKING applications in a data table
```

### 3.4 Address Change Flow

```
citizen opens /address/addressChange.xhtml (RequestScoped AddressChangeBean)
  → enters street (required), house number (optional), postcode (exactly 5 chars), city (required)
  → submit → AddressChangeBean.validateAndSubmit()
    → inline validation (street, postcode length, city)
    → AddressChangeService.submitChange()
      → validates again (duplicated logic)
      → creates APPLICATION record (PENDING, notes = "Neue Adresse: ...")
      → citizen's stored address NOT updated (awaiting approval workflow)
    ├── success → successMessage + outcome "addressSuccess"
    └── error   → FacesMessage
  → page shows citizen's own ADDRESS applications in a data table
```

### 3.5 Dog Registration Flow

```
citizen opens /dog/dogRegistration.xhtml (RequestScoped DogRegistrationBean)
  → enters dog name (required), breed (optional), chip number (optional)
  → submit → DogRegistrationBean.registerDog()
    → inline validation (dog name required)
    → DogRegistrationService.register()
      → creates DOG_REGISTRATION record
    ├── success → successMessage, fields cleared, search() refreshes list, outcome "dogSuccess"
    └── error   → FacesMessage
  → search form allows free-text search by dog name or breed (JPQL LIKE)
  → PrimeFaces p:dataTable with client-side pagination (10 rows default)
```

### 3.6 Logout Flow

```
loginBean.logout()
  → invalidates HTTP session
  → navigates to /login.xhtml
```

---

## 4. Business Rules and Validations

### 4.1 Authentication
- Single hardcoded credential: `buerger` / `demo-password`
- Session expires after 30 minutes (web.xml)
- No CSRF protection, no password hashing, no multi-user support

### 4.2 Parking Permit
| Rule | Location |
|---|---|
| Vehicle registration ≥ 5 characters | `ParkingPermitBean` (inline) **and** `ParkingPermitService` (duplicated) |
| Zone must not be empty | `ParkingPermitBean` (inline only) |
| Vehicle registration normalised to UPPERCASE | `ParkingPermitService.createApplication()` |
| Zones: Zone A, Zone B, Zone C, Innenstadt | Hardcoded list in `ParkingPermitService.getZones()` |
| Zone fees (display only, not enforced): A/B €30, C €45, Innenstadt €120 | Static HTML in `parkingPermit.xhtml` |
| Processing SLA: 5 working days (display only) | Static HTML |
| Permit validity: 12 months from approval (display only) | Static HTML |

### 4.3 Address Change
| Rule | Location |
|---|---|
| Street required (non-empty) | `AddressChangeBean` (inline) **and** `AddressChangeService` (duplicated) |
| Postcode must be exactly 5 characters | `AddressChangeBean` (inline) **and** `AddressChangeService.validatePostcode()` |
| City required (non-empty) | `AddressChangeBean` only |
| Postcode only checks length, not digit-only (regex `^\d{5}$` noted as TODO) | `AddressChangeService` |
| New address stored in `APPLICATION.NOTES`, citizen record not updated until approved | `AddressChangeService` (commented dead code left in place) |
| Legal obligation: registration within 2 weeks per §17 BMG, max €1,000 fine | Display-only notice in `addressChange.xhtml` |

### 4.4 Dog Registration
| Rule | Location |
|---|---|
| Dog name required (non-empty) | `DogRegistrationBean` (inline) **and** `DogRegistrationService` (duplicated) |
| Chip number format (15-digit ISO 11784) — **not validated**, noted as TODO | `DogRegistrationService` |
| Dog-tax rates (display only): 1st dog €60/yr, 2nd €90/yr, dangerous breeds €900/yr, guide dogs exempt | Static HTML in `dogRegistration.xhtml` |
| Dangerous-breed environmental permit — **not implemented**, noted as TODO | `DogRegistrationService` |

### 4.5 Application Workflow States
All applications share an `ApplicationStatus` enum: `PENDING → APPROVED | REJECTED`

No workflow guard prevents re-opening a rejected application (noted as TODO in `ParkingPermitService.updateApplication()`). Status transitions are only exercised by the seeded demo data; there is no admin UI for approving/rejecting applications in the application itself (admin page exists at `/admin/index.xhtml` but its content was not examined as it fell outside the main user flows).

---

## 5. Technical Architecture

### 5.1 Runtime Platform
| Component | Version |
|---|---|
| Application server | IBM WebSphere Liberty (Open Liberty) with `webProfile-8.0` feature |
| Java | Java 8 (source/target 1.8) |
| Presentation | JSF 2.2 (javax.faces) + PrimeFaces 6.2 |
| Business logic | EJB 3.x Stateless Session Beans |
| Persistence | JPA 2.2 / Hibernate 5.6 (H2 in-memory DB) |
| Build | Maven 3 + `liberty-maven-plugin` 3.10 |

### 5.2 Request Handling
All HTTP requests enter via `javax.faces.webapp.FacesServlet` mapped to `*.xhtml`. There is no Struts ActionServlet — the framework is JSF. Navigation is controlled by explicit outcome-based rules in `faces-config.xml`.

### 5.3 Layered Architecture

```
┌───────────────────────────────────────────────────────────┐
│  View Layer (JSF Facelets — .xhtml)                        │
│  login.xhtml / dashboard.xhtml / parkingPermit.xhtml       │
│  addressChange.xhtml / dogRegistration.xhtml               │
│  layout.xhtml (Facelets template)                          │
└───────────────┬───────────────────────────────────────────┘
                │ EL bindings #{bean.property} / #{bean.action()}
┌───────────────▼───────────────────────────────────────────┐
│  Managed Bean Layer (JSF Backing Beans)                     │
│  LoginBean (Session)  / DashboardBean (Request)            │
│  ParkingPermitBean (Session — problematic scope)           │
│  AddressChangeBean (Request) / DogRegistrationBean (Request)│
└───────────────┬───────────────────────────────────────────┘
                │ @EJB injection
┌───────────────▼───────────────────────────────────────────┐
│  Service Layer (EJB @Stateless)                             │
│  ParkingPermitService / AddressChangeService               │
│  DogRegistrationService / CitizenRegistryService (stub)    │
└───────────────┬───────────────────────────────────────────┘
                │ @EJB injection
┌───────────────▼───────────────────────────────────────────┐
│  DAO Layer (EJB @Stateless + JPA EntityManager)            │
│  ApplicationDao / CitizenDao                               │
│  ParkingPermitDao / DogRegistrationDao                     │
└───────────────┬───────────────────────────────────────────┘
                │ JNDI DataSource jdbc/buergerportal
┌───────────────▼───────────────────────────────────────────┐
│  Database (H2 in-memory, MySQL-mode)                       │
│  CITIZEN / APPLICATION / PARKING_PERMIT / DOG_REGISTRATION │
└───────────────────────────────────────────────────────────┘
```

### 5.4 Startup and Schema Initialisation
`DataInitializer` (`@Singleton @Startup`) drops and recreates the four tables via native DDL after the full component context is available (Hibernate's `hbm2ddl.auto=none` is intentionally set to avoid a Liberty-specific stub-connection crash at SessionFactory init time). It then seeds 12 citizens, 6 parking applications, 4 address applications, and 11 dog registrations.

---

## 6. Component Details

### 6.1 JSF Managed Beans

| Bean | Scope | Responsibilities |
|---|---|---|
| `LoginBean` | Session | Credential validation, session attributes, logout |
| `DashboardBean` | Request | Aggregated stats via DAO queries; no direct service calls |
| `ParkingPermitBean` | **Session** (anti-pattern) | Form state, submit, clear, zone list, application list, status CSS |
| `AddressChangeBean` | Request | Form state, validate+submit combined, application list |
| `DogRegistrationBean` | Request | Form state, register, search, clear search, results list |

### 6.2 EJB Services

| Service | Key Operations |
|---|---|
| `ParkingPermitService` | `createApplication`, `updateApplication`, `getZones`, `getAllParkingApplications`, `getPermitForApplication` |
| `AddressChangeService` | `submitChange`, `validatePostcode`, `getAllAddressApplications` |
| `DogRegistrationService` | `register`, `update`, `search`, `getAllRegistrations` |
| `CitizenRegistryService` | `lookupCitizen` (SOAP stub — 200ms artificial latency, returns mock data) |

### 6.3 EJB DAOs

| DAO | Notable Queries |
|---|---|
| `ApplicationDao` | findByCitizenId, findRecentApplicationsByCitizen, countByCitizenAndStatus, countByCitizenAndType |
| `CitizenDao` | findById, findByLastName (LIKE), findByPostcode |
| `ParkingPermitDao` | findByApplicationId, findByZone, countByCitizenId |
| `DogRegistrationDao` | findByCitizenId, searchByNameOrBreedForCitizen (LIKE), countByCitizenId |

All DAOs use inline JPQL strings (no `@NamedQuery`; TODOs present throughout). No pagination is implemented despite TODO comments.

### 6.4 JSF Navigation (faces-config.xml)

| From view | Outcome | To view |
|---|---|---|
| `/login.xhtml` | `dashboard` | `/dashboard.xhtml` |
| `/login.xhtml` | `loginFailed` | `/login.xhtml` |
| `/dashboard.xhtml` | `parkingPermit` | `/parking/parkingPermit.xhtml` |
| `/dashboard.xhtml` | `addressChange` | `/address/addressChange.xhtml` |
| `/dashboard.xhtml` | `dogRegistration` | `/dog/dogRegistration.xhtml` |
| `/dashboard.xhtml` | `logout` | `/login.xhtml` |
| `/parking/parkingPermit.xhtml` | `parkingSuccess` | `/parking/parkingPermit.xhtml` (self) |
| `/parking/parkingPermit.xhtml` | `dashboard` | `/dashboard.xhtml` |
| `/address/addressChange.xhtml` | `addressSuccess` | `/address/addressChange.xhtml` (self) |
| `/address/addressChange.xhtml` | `dashboard` | `/dashboard.xhtml` |
| `/dog/dogRegistration.xhtml` | `dogSuccess` | `/dog/dogRegistration.xhtml` (self) |
| `/dog/dogRegistration.xhtml` | `dashboard` | `/dashboard.xhtml` |

### 6.5 View Templates
All authenticated pages extend `/WEB-INF/templates/layout.xhtml` via `<ui:composition template="...">`. The template provides:
- Blue-gradient header with logo and logout link
- 200px left navigation panel (fixed-width, table-based)
- 760px content area
- Footer with version and legal links
- Global CSS (`portal.css`) and JS (`portal.js`)

The layout is entirely table-based at fixed 960px width with no media queries — not responsive.

---

## 7. Data Model

### 7.1 Entity Relationships

```
CITIZEN (1) ──< APPLICATION (many)
CITIZEN (1) ──< DOG_REGISTRATION (many)
APPLICATION (1) ──── PARKING_PERMIT (0 or 1, unique FK)
```

### 7.2 Tables

**CITIZEN**
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, AUTO_INCREMENT |
| FIRST_NAME | VARCHAR(100) | NOT NULL |
| LAST_NAME | VARCHAR(100) | NOT NULL |
| STREET | VARCHAR(200) | |
| HOUSE_NUMBER | VARCHAR(20) | |
| POSTCODE | VARCHAR(10) | |
| CITY | VARCHAR(100) | |
| EMAIL | VARCHAR(200) | |
| PHONE | VARCHAR(50) | |
| REGISTERED_DATE | DATE | |

**APPLICATION**
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, AUTO_INCREMENT |
| CITIZEN_ID | BIGINT | FK → CITIZEN, NOT NULL |
| TYPE | VARCHAR(20) | PARKING / ADDRESS / DOG |
| STATUS | VARCHAR(20) | PENDING / APPROVED / REJECTED |
| CREATED_DATE | DATE | NOT NULL |
| LAST_UPDATED | DATE | |
| NOTES | VARCHAR(500) | Address change details stored here |

**PARKING_PERMIT**
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, AUTO_INCREMENT |
| APPLICATION_ID | BIGINT | FK → APPLICATION, UNIQUE |
| VEHICLE_REGISTRATION | VARCHAR(20) | NOT NULL, stored UPPERCASE |
| ZONE | VARCHAR(50) | |
| PROOF_DOCUMENT_PATH | VARCHAR(500) | Path string, no actual upload |

**DOG_REGISTRATION**
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, AUTO_INCREMENT |
| CITIZEN_ID | BIGINT | FK → CITIZEN, NOT NULL |
| DOG_NAME | VARCHAR(100) | NOT NULL |
| BREED | VARCHAR(100) | |
| REGISTRATION_DATE | DATE | NOT NULL |
| CHIP_NUMBER | VARCHAR(50) | Format not validated |

---

## 8. Integration Points

### 8.1 CitizenRegistryService (Legacy SOAP Stub)

- **Endpoint**: `http://registry.musterstadt.de/ws/citizen` (decommissioned 2019)
- **Original client**: Apache Axis 1.4
- **Current state**: Returns hardcoded mock `CitizenRegistryResponse` with 200ms simulated latency
- **TODO**: Jira PORTAL-88 (open since 2019) — migrate to REST
- **Impact**: The stub is not called from any active user flow; it is a dead code path as of this version

### 8.2 Database

- **JNDI name**: `jdbc/buergerportal`
- **Type**: H2 in-memory with `MODE=MySQL`
- **Lifecycle**: Schema dropped and recreated on every Liberty server restart; data is ephemeral
- **JTA transactions**: Managed by Liberty's transaction manager; all DAOs participate via `@PersistenceContext(unitName="BuergerportalPU")`

### 8.3 No Other External Integrations

There is no email system, no file storage backend (document paths are plain text strings), no payment gateway, and no SSO/LDAP integration. All are single-server, single-process.
