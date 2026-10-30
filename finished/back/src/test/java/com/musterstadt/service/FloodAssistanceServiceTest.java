package com.musterstadt.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for FloodAssistanceService validation logic.
 * Tests run in isolation — no container, no mocking framework.
 * One test per business rule, mirroring AddressChangeServiceTest style.
 */
public class FloodAssistanceServiceTest {

    // Instantiate directly — no CDI container needed for pure validation
    private final FloodAssistanceService service = new FloodAssistanceService();

    // ── damageDescription ───────────────────────────────────────────────────

    @Test
    public void emptyDamageDescriptionThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "", "Hauptstraße 1", "80331", "MITTEL"));
        assertTrue(ex.getMessage().contains("Schadensbeschreibung"));
    }

    @Test
    public void nullDamageDescriptionThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, null, "Hauptstraße 1", "80331", "MITTEL"));
        assertTrue(ex.getMessage().contains("Schadensbeschreibung"));
    }

    @Test
    public void damageDescriptionOver500CharsThrowsIllegalArgument() {
        String tooLong = "A".repeat(501);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, tooLong, "Hauptstraße 1", "80331", "MITTEL"));
        assertTrue(ex.getMessage().contains("500"));
    }

    // ── affectedStreet ──────────────────────────────────────────────────────

    @Test
    public void emptyAffectedStreetThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", "", "80331", "LEICHT"));
        assertTrue(ex.getMessage().contains("Straße"));
    }

    @Test
    public void nullAffectedStreetThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", null, "80331", "LEICHT"));
        assertTrue(ex.getMessage().contains("Straße"));
    }

    // ── postcode ────────────────────────────────────────────────────────────

    @Test
    public void validFiveDigitPostcodePassesValidation() {
        // Validation passes the postcode check; will then fail on CitizenDao (citizenDao is null).
        // We only care that the postcode itself does NOT throw the postcode error.
        try {
            service.createApplication(1L, "Keller überflutet", "Hauptstraße 1", "80331", "MITTEL");
        } catch (IllegalArgumentException e) {
            assertFalse(e.getMessage().contains("Postleitzahl"),
                    "Postcode error must not appear for valid 5-digit postcode");
        } catch (NullPointerException e) {
            // Expected — citizenDao is null in plain instantiation, that's acceptable
        }
    }

    @Test
    public void fourDigitPostcodeThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", "Hauptstraße 1", "8033", "MITTEL"));
        assertTrue(ex.getMessage().contains("Postleitzahl"));
    }

    @Test
    public void nonNumericPostcodeThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", "Hauptstraße 1", "ABCDE", "MITTEL"));
        assertTrue(ex.getMessage().contains("Postleitzahl"));
    }

    @Test
    public void nullPostcodeThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", "Hauptstraße 1", null, "MITTEL"));
        assertTrue(ex.getMessage().contains("Postleitzahl"));
    }

    // ── severityLevel ───────────────────────────────────────────────────────

    @Test
    public void invalidSeverityLevelThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", "Hauptstraße 1", "80331", "EXTREM"));
        assertTrue(ex.getMessage().contains("Schweregrad"));
    }

    @Test
    public void nullSeverityLevelThrowsIllegalArgument() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                service.createApplication(1L, "Keller überflutet", "Hauptstraße 1", "80331", null));
        assertTrue(ex.getMessage().contains("Schweregrad"));
    }
}
