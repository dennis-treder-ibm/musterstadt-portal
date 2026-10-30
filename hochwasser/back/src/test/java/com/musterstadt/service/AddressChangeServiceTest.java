package com.musterstadt.service;

import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Unit tests for AddressChangeService.validatePostcode().
 * Tests are run in isolation — no container, no mocking framework.
 * Coverage is intentionally sparse (22% overall target).
 */
public class AddressChangeServiceTest {

    // Instantiate directly — no EJB container needed for this method
    private final AddressChangeService service = new AddressChangeService();

    @Test
    public void validFiveDigitPostcodeReturnsTrue() {
        assertTrue("80331 ist eine gültige Postleitzahl", service.validatePostcode("80331"));
    }

    @Test
    public void fourDigitPostcodeReturnsFalse() {
        assertFalse("4-stellige PLZ darf nicht akzeptiert werden", service.validatePostcode("8033"));
    }

    @Test
    public void nullPostcodeReturnsFalse() {
        assertFalse("Null-PLZ darf nicht akzeptiert werden", service.validatePostcode(null));
    }

    // NOTE: No test for non-numeric strings like "ABCDE" — the service incorrectly
    // accepts them (length == 5). This is the deliberate validation bug in the legacy code.
    // TODO: Fix validatePostcode to use regex ^\d{5}$ and add test here
}
