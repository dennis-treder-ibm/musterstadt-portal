# Bürgerportal Musterstadt — Architecture Documentation

---

## 1. Executive Summary

The **Bürgerportal Musterstadt** ("Citizen Portal Musterstadt") is a German municipal e-government web application built on **Java EE 8 / JSF 2.2** and deployed on **WebSphere Liberty**. It enables registered citizens of a fictional city ("Musterstadt") to submit three types of administrative applications online:

- **Parking permit** application (`Parkausweis`)
- **Address change** notification (`Adressänderung`)
- **Dog registration** (`Hundeanmeldung`)

The application uses a classic **server-side rendered** architecture with JSF (JavaServer Faces) as the UI framework, PrimeFaces 6.2 for enriched components (paginated data tables), EJB Stateless Session Beans for the service and DAO layers, JPA (Hibernate) as the ORM, and an in-memory H2 database seeded with test data on startup.

The codebase deliberately preserves numerous legacy patterns (session-scoped form beans, inline validation, duplicated business logic, table-based CSS layout) to serve as a representative modernisation target.

---

## 2. Functional Overview

### Application Purpose

The portal acts as a digital front door to the municipal administration, offering self-service forms for routine bureaucratic procedures that would otherwise require a physical visit to the Rathaus.

### Main Feature Areas

| Feature | Description | German Label |
|---|---|---|
| Login / Logout | Single demo-user session management | Anmeldung |
| Dashboard | Statistics overview + recent activity feed | Startseite |
| Parking Permit | Apply for a residential zone parking sticker | Parkausweis beantragen |
| Address Change | Notify the registry office of a new address (§ 17 BMG obligation) | Adressänderung melden |
| Dog Registration | Register a pet dog and manage registrations | Hund anmelden |
| Citizen Registry Lookup | (Stub) SOAP-based lookup by surname against a central registry | Bürgerregister |
| Flood Aid | (Planned, not yet implemented) | Hochwasserhilfe |

---

## 3. High-Level Functional Flows

### 3.1 Authentication Flow

```
Browser → GET /buergerportal/login.xhtml
         → loginForm POST → LoginBean.login()
              ├─ credentials match → HttpSession set → outcome "dashboard"
              └─ credentials fail  → outcome "loginFailed" → /login.xhtml (error shown)

Logout: Header link → LoginBean.logout() → session.invalidate() → outcome "logout" → /login.xhtml
```

### 3.2 Parking Permit Workflow

```
Dashboard (quick link) → /parking/parkingPermit.xhtml
  Form: vehicle registration, zone (dropdown), proof document path
  POST → ParkingPermitBean.submitApplication()
       → ParkingPermitService.createApplication(citizenId, reg, zone, proofPath)
            ├─ validation failure → IllegalArgumentException → FacesMessage → same page
            └─ success → Application (PENDING) + ParkingPermit persisted
                       → outcome "parkingSuccess" → same page (success banner)

Status transitions: PENDING → APPROVED | REJECTED
  (managed manually via ParkingPermitService.updateApplication — no UI for this yet)
```

### 3.3 Address Change Workflow

```
Dashboard (quick link) → /address/addressChange.xhtml
  Form: street (required), house number, postcode (required, 5 chars), city (required)
  POST → AddressChangeBean.validateAndSubmit()
       → inline bean-level validation
       → AddressChangeService.submitChange(citizenId, street, houseNumber, postcode, city)
            ├─ postcode invalid or street blank → IllegalArgumentException → FacesMessage
            └─ success → Application (PENDING) created with notes string
                       → outcome "addressSuccess" → same page (success banner)

Note: citizen address record is NOT updated on submission; a pending application is created only.
```

### 3.4 Dog Registration Workflow

```
Dashboard (quick link) → /dog/dogRegistration.xhtml
  Form: dog name (required), breed (optional), chip number (optional)
  POST → DogRegistrationBean.registerDog()
       → DogRegistrationService.register(citizenId, dogName, breed, chipNumber)
            ├─ dog name blank → IllegalArgumentException → FacesMessage
            └─ success → DogRegistration persisted
                       → search() called to refresh list
                       → outcome "dogSuccess" → same page

Search: separate searchForm → DogRegistrationBean.search() → JPQL LIKE filter on name/breed
```

---

## 4. Business Rules and Validations

### 4.1 Login

| Rule | Implementation |
|---|---|
| Only one hardcoded user allowed (`buerger` / `demo-password`) | `LoginBean.login()` — static constants |
| Session attribute `loggedIn` set to `Boolean.TRUE` on success | `HttpSession.setAttribute()` |
| Session timeout: 30 minutes | `web.xml` `<session-timeout>` |

### 4.2 Parking Permit

| Rule | Implementation |
|---|---|
| Vehicle registration must be ≥ 5 characters | `ParkingPermitBean.submitApplication()` AND `ParkingPermitService.createApplication()` (duplicated) |
| Zone must be non-empty | `ParkingPermitBean.submitApplication()` |
| Citizen must exist | `ParkingPermitService.createApplication()` |
| Available zones: Zone A, Zone B, Zone C, Innenstadt | `ParkingPermitService.getZones()` — hardcoded list |
| Vehicle registration stored as UPPERCASE | `vehicleRegistration.trim().toUpperCase()` |
| New application status always starts as PENDING | `ApplicationStatus.PENDING` |

### 4.3 Address Change

| Rule | Implementation |
|---|---|
| Street must be non-empty | `AddressChangeBean.validateAndSubmit()` AND `AddressChangeService.submitChange()` (duplicated) |
| Postcode must be exactly 5 characters | Bean + Service (both check `length() == 5`; no regex — accepts non-numeric) |
| City must be non-empty | Bean only |
| Legal obligation: registration within 2 weeks of moving (§ 17 BMG) | Displayed as UI notice only; not enforced in code |

### 4.4 Dog Registration

| Rule | Implementation |
|---|---|
| Dog name must be non-empty | `DogRegistrationBean.registerDog()` AND `DogRegistrationService.register()` |
| Chip number format (15-digit ISO 11784) | **Not validated** — documented as TODO |
| Dog tax rates displayed in UI | Static HTML table; not calculated in backend |
| Listed/dangerous breeds require environmental permit | **Not implemented** — documented as TODO |

### 4.5 Application Status Transitions

```
PENDING ──► APPROVED
PENDING ──► REJECTED
(REJECTED ──► APPROVED is noted as lacking guard — TODO in ParkingPermitService)
```

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology |
|---|---|
| Runtime | WebSphere Liberty (webProfile-8.0) |
| Presentation | JSF 2.2 (Facelets), PrimeFaces 6.2 |
| Business Logic | EJB 3.2 Stateless Session Beans |
| Persistence | JPA 2.2 (Hibernate 5.6), JPQL |
| Database | H2 in-memory (MySQL-compatible mode) |
| Build | Maven (WAR packaging) |
| Template | Facelets `ui:composition` / `ui:define` |

### 5.2 Request-Processing Pipeline

```
HTTP Request (*.xhtml)
  │
  ▼
FacesServlet (javax.faces.webapp.FacesServlet)
  │
  ▼
JSF Lifecycle (Restore View → Apply Request Values → Process Validations
               → Update Model Values → Invoke Application → Render Response)
  │
  ├─ Invoke Application: calls EL action expression #{bean.method()}
  │      │
  │      ▼
  │   Managed Bean (backing bean) — delegates to EJB service
  │      │
  │      ▼
  │   EJB Stateless Service — validation + business logic — delegates to EJB DAO
  │      │
  │      ▼
  │   EJB Stateless DAO — JPQL queries via EntityManager
  │      │
  │      ▼
  │   H2 In-Memory Database
  │
  ▼
Navigation outcome → faces-config.xml navigation rules → to-view-id
  │
  ▼
Render Response → Facelets template + page composition → HTML sent to browser
```

### 5.3 Navigation Rules (faces-config.xml)

| From View | Outcome | To View |
|---|---|---|
| `/login.xhtml` | `dashboard` | `/dashboard.xhtml` |
| `/login.xhtml` | `loginFailed` | `/login.xhtml` |
| `/dashboard.xhtml` | `parkingPermit` | `/parking/parkingPermit.xhtml` |
| `/dashboard.xhtml` | `addressChange` | `/address/addressChange.xhtml` |
| `/dashboard.xhtml` | `dogRegistration` | `/dog/dogRegistration.xhtml` |
| `/dashboard.xhtml` | `logout` | `/login.xhtml` |
| `/parking/parkingPermit.xhtml` | `parkingSuccess` | `/parking/parkingPermit.xhtml` |
| `/address/addressChange.xhtml` | `addressSuccess` | `/address/addressChange.xhtml` |
| `/dog/dogRegistration.xhtml` | `dogSuccess` | `/dog/dogRegistration.xhtml` |
| Any | `dashboard` | `/dashboard.xhtml` |

---

## 6. Component Details

### 6.1 Managed Beans (Backing Beans)

| Bean | Scope | Responsibility |
|---|---|---|
| `LoginBean` | `@SessionScoped` | Credential validation, session management, logout. Holds `loggedIn` flag and `citizenId` for the duration of the session. |
| `DashboardBean` | `@RequestScoped` | Aggregates statistics counts (permits, registrations, open/approved/rejected applications) and recent activity list for the current citizen. |
| `AddressChangeBean` | `@RequestScoped` | Holds address form fields; performs inline validation before delegating to `AddressChangeService`; loads all address applications for the citizen. |
| `DogRegistrationBean` | `@RequestScoped` | Holds registration form fields and search query; calls `DogRegistrationService` for register/search/clear operations. |
| `ParkingPermitBean` | `@SessionScoped` | Holds parking form fields; performs inline validation; delegates to `ParkingPermitService`; session scope causes cross-tab state bleed (documented anti-pattern). |

> **Note:** All beans inject `LoginBean` via `@ManagedProperty(value = "#{loginBean}")` to obtain the current `citizenId`.

### 6.2 EJB Service Layer

| Service | Key Operations |
|---|---|
| `AddressChangeService` | `submitChange()` — validates, creates `Application(PENDING)`; `validatePostcode()` — length-only check; `getAllAddressApplications()` |
| `ParkingPermitService` | `createApplication()` — creates `Application` + `ParkingPermit`; `updateApplication()` — status change; `getZones()` — hardcoded list; `getAllParkingApplications()` |
| `DogRegistrationService` | `register()` — creates `DogRegistration`; `update()` — name/breed edit; `search()` — JPQL LIKE; `getAllRegistrations()` |
| `CitizenRegistryService` | `lookupCitizen()` — **stub only**; simulates 200 ms SOAP latency; returns mock response. Real endpoint decommissioned 2019. |

### 6.3 EJB DAO Layer

| DAO | Persistence Unit | Key Queries |
|---|---|---|
| `CitizenDao` | `BuergerportalPU` | `findById`, `findAll`, `findByPostcode`, `findByLastName`, `save`, `update`, `countAll` |
| `ApplicationDao` | `BuergerportalPU` | `findByCitizenId`, `findByType`, `findByStatus`, `findRecentApplicationsByCitizen`, `countByCitizenAndStatus`, `countByCitizenAndType`, `save`, `update` |
| `ParkingPermitDao` | `BuergerportalPU` | `findByApplicationId`, `findByZone`, `findAll`, `save`, `update`, `countByCitizenId` |
| `DogRegistrationDao` | `BuergerportalPU` | `findByCitizenId`, `findByBreed`, `searchByNameOrBreedForCitizen`, `save`, `update`, `countByCitizenId` |

### 6.4 Facelets Views

| View File | Template | Bean(s) Used | Forms |
|---|---|---|---|
| `login.xhtml` | None (standalone page) | `loginBean` | `loginForm` → `LoginBean.login()` |
| `dashboard.xhtml` | `layout.xhtml` | `dashboardBean`, `loginBean` | None (read-only + quick links) |
| `address/addressChange.xhtml` | `layout.xhtml` | `addressChangeBean`, `loginBean` | `addressForm` → `AddressChangeBean.validateAndSubmit()` |
| `dog/dogRegistration.xhtml` | `layout.xhtml` | `dogRegistrationBean`, `loginBean` | `dogForm`, `searchForm`, `dogTableForm` (PrimeFaces pagination) |
| `parking/parkingPermit.xhtml` | `layout.xhtml` | `parkingPermitBean`, `loginBean` | `parkingForm` → `ParkingPermitBean.submitApplication()` |
| `admin/index.xhtml` | `layout.xhtml` | (TBD) | Admin overview placeholder |
| `WEB-INF/templates/layout.xhtml` | Master template | `loginBean` | `headerForm` → `LoginBean.logout()` |

### 6.5 Startup Component

**`DataInitializer`** (`@Singleton @Startup`) runs at application startup via `@PostConstruct`:

1. Drops and recreates all four tables via native DDL (in reverse FK order)
2. Seeds 12 demo citizens, 6 parking applications + permits, 4 address applications, 11 dog registrations
3. The `hbm2ddl.auto=none` setting in `persistence.xml` prevents Hibernate from attempting DDL at `SessionFactory` init (Liberty provides only a stub connection at that point).

---

## 7. Data Model

### 7.1 Entity Relationship Overview

```
CITIZEN (1) ──< APPLICATION (many)
CITIZEN (1) ──< DOG_REGISTRATION (many)
APPLICATION (1) ──── PARKING_PERMIT (0..1)   [unique FK]
```

### 7.2 Entities

#### CITIZEN
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, auto-increment |
| FIRST_NAME | VARCHAR(100) | NOT NULL |
| LAST_NAME | VARCHAR(100) | NOT NULL |
| STREET | VARCHAR(200) | |
| HOUSE_NUMBER | VARCHAR(20) | |
| POSTCODE | VARCHAR(10) | |
| CITY | VARCHAR(100) | |
| EMAIL | VARCHAR(200) | |
| PHONE | VARCHAR(50) | |
| REGISTERED_DATE | DATE | |

#### APPLICATION
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, auto-increment |
| CITIZEN_ID | BIGINT | FK → CITIZEN, NOT NULL |
| TYPE | VARCHAR(20) | NOT NULL (`PARKING`, `ADDRESS`, `DOG`) |
| STATUS | VARCHAR(20) | NOT NULL (`PENDING`, `APPROVED`, `REJECTED`) |
| CREATED_DATE | DATE | NOT NULL |
| LAST_UPDATED | DATE | |
| NOTES | VARCHAR(500) | (address stored as free text here) |

#### PARKING_PERMIT
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, auto-increment |
| APPLICATION_ID | BIGINT | FK → APPLICATION, NOT NULL, UNIQUE |
| VEHICLE_REGISTRATION | VARCHAR(20) | NOT NULL |
| ZONE | VARCHAR(50) | |
| PROOF_DOCUMENT_PATH | VARCHAR(500) | |

#### DOG_REGISTRATION
| Column | Type | Constraints |
|---|---|---|
| ID | BIGINT | PK, auto-increment |
| CITIZEN_ID | BIGINT | FK → CITIZEN, NOT NULL |
| DOG_NAME | VARCHAR(100) | NOT NULL |
| BREED | VARCHAR(100) | |
| REGISTRATION_DATE | DATE | NOT NULL |
| CHIP_NUMBER | VARCHAR(50) | |

### 7.3 Application Type / Status Enums

```
ApplicationType  : PARKING | ADDRESS | DOG
ApplicationStatus: PENDING  | APPROVED | REJECTED
```

---

## 8. Integration Points

### 8.1 Internal Components

| Integration | Mechanism |
|---|---|
| Bean → Service | `@EJB` injection into `@ManagedBean` |
| Service → DAO | `@EJB` injection |
| DAO → Database | `@PersistenceContext(unitName="BuergerportalPU")` → JTA DataSource `jdbc/buergerportal` |
| DataInitializer → Database | Direct `EntityManager` (`persist`, `createNativeQuery`) |
| Bean → LoginBean | `@ManagedProperty(value = "#{loginBean}")` |

### 8.2 External Systems (Current / Stubbed)

| System | Protocol | Status |
|---|---|---|
| Bürgerregister (`registry.musterstadt.de`) | SOAP (Apache Axis 1.4) | **Decommissioned 2019.** `CitizenRegistryService` is a stub returning mock data with 200 ms artificial latency. Jira PORTAL-88 tracks migration to REST. |

### 8.3 Infrastructure

| Component | Value |
|---|---|
| Application server | WebSphere Liberty (webProfile-8.0) |
| HTTP port | 9080 |
| HTTPS port | 9443 |
| Context root | `/buergerportal` |
| Database | H2 in-memory (`jdbc:h2:mem:buergerportal;DB_CLOSE_DELAY=-1;MODE=MySQL`) |
| JNDI data source name | `jdbc/buergerportal` |
| WAR artifact | `buergerportal.war` |

### 8.4 Known Technical Debt Highlights

| Issue | Location |
|---|---|
| Hardcoded single demo credential | `LoginBean` |
| Session-scoped form bean (cross-tab state bleed) | `ParkingPermitBean` |
| Inline validation duplicated in bean AND service | `AddressChangeBean` + `AddressChangeService`, `ParkingPermitBean` + `ParkingPermitService` |
| Postcode validation accepts non-numeric 5-char strings | `AddressChangeService.validatePostcode()` |
| Chip number format not validated | `DogRegistrationService.register()` |
| Dead code preserved "just in case" | `AddressChangeService.submitChange()` (commented-out citizen update) |
| Hardcoded zone list maintained since 2009 | `ParkingPermitService.getZones()` |
| No pagination on most DAO queries | All DAO `findAll` / `findByCitizenId` methods |
| Table-based layout, fixed 960px width, no mobile support | `layout.xhtml`, all XHTML views |
| No ARIA roles, no accessible error messages | All XHTML forms |
| SOAP stub never replaced with REST | `CitizenRegistryService` |
| `PrimeFaces.THEME = none` — unstyled base only | `web.xml` |
