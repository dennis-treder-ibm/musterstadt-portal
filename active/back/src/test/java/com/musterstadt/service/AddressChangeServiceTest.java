package com.musterstadt.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AddressChangeService.validatePostcode().
 * Tests are run in isolation — no container, no mocking framework.
 * Coverage is intentionally sparse (22% overall target).
 */
public class AddressChangeServiceTest {

    // Instantiate directly — no container needed for this method
    private final AddressChangeService service = new AddressChangeService();

    @Test
    void validFiveDigitPostcodeReturnsTrue() {
        assertTrue(service.validatePostcode("80331"), "80331 ist eine gültige Postleitzahl");
    }

    @Test
    void fourDigitPostcodeReturnsFalse() {
        assertFalse(service.validatePostcode("8033"), "4-stellige PLZ darf nicht akzeptiert werden");
    }

    @Test
    void nullPostcodeReturnsFalse() {
        assertFalse(service.validatePostcode(null), "Null-PLZ darf nicht akzeptiert werden");
    }

    // NOTE: No test for non-numeric strings like "ABCDE" — the service incorrectly
    // accepts them (length == 5). This is the deliberate validation bug in the legacy code.
    // TODO: Fix validatePostcode to use regex ^\d{5}$ and add test here
}
