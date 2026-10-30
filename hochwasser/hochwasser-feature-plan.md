# Hochwasserhilfe — Feature Spec

## Goal

Add a self-service flood damage assistance application to the Bürgerportal.
Citizens can submit a damage report, select a severity level, and track the
status of their application. The feature is currently a disabled stub in the
navigation ("Demnächst verfügbar") — this spec makes it real.

---

## Business Rules

- Damage description is required (max 500 chars)
- Affected street is required
- Postcode must be exactly 5 digits (`^\d{5}$`)
- Severity level must be one of: `LEICHT`, `MITTEL`, `SCHWER`
- Citizens can submit multiple applications
- Application starts as `PENDING`; uses the shared `APPLICATION` table
- Flood-specific data goes into a new `FLOOD_ASSISTANCE` table (FK → APPLICATION)

---

## Implementation Guidelines

Follow the **existing patterns** for every layer — don't invent new ones:

- **Model/DAO** → mirror `ParkingPermit` / `ParkingPermitDao`
- **Service** → mirror `DogRegistrationService` (validation in service, not in resource)
- **REST resource** → mirror `ParkingResource` (`@Tag`, `@Operation` MicroProfile OpenAPI annotations)
- **DTO** → mirror `ParkingApplicationDto`
- **Frontend service** → mirror `dogService.ts`
- **Frontend page** → mirror `DogRegistrationPage.tsx` (Carbon Design System)
- Add `FLOOD` to `Application.ApplicationType` enum and `getTypeDisplay()`
- Enable the disabled nav item in `AppShell.tsx`; remove the "coming soon" notice in `DashboardPage.tsx`

---

## Tests

**Unit tests** (`FloodAssistanceServiceTest.java`):
- One test per business rule (JUnit 4, plain `new FloodAssistanceService()`, no mocks)
- Mirror the style of `AddressChangeServiceTest.java`

**E2E** (`flood-assistance.spec.ts`):
- Mirror `dog-registration.spec.ts`
- Three scenarios: required-field error, successful submission, result in table
