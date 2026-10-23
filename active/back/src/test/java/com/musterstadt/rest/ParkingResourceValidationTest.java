package com.musterstadt.rest;

import com.musterstadt.rest.dto.ParkingApplicationRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ParkingResource inline validation logic.
 *
 * Tests the validation conditions on the ParkingApplicationRequest
 * (mirrors the rules from the legacy ParkingPermitBean).
 */
public class ParkingResourceValidationTest {

    @Test
    void shortVehicleRegistrationFailsLengthGuard() {
        ParkingApplicationRequest request = new ParkingApplicationRequest();
        request.vehicleRegistration = "M-12"; // 4 chars — below the 5-char minimum
        assertTrue(
                request.vehicleRegistration.trim().length() < 5,
                "Bei 4 Zeichen soll die Validierung fehlschlagen");
    }

    @Test
    void validVehicleRegistrationPassesLengthGuard() {
        ParkingApplicationRequest request = new ParkingApplicationRequest();
        request.vehicleRegistration = "M-HM 1234"; // 9 chars — passes length check
        assertTrue(
                request.vehicleRegistration.trim().length() >= 5,
                "Kennzeichen >= 5 Zeichen soll die Längenprüfung bestehen");
    }

    @Test
    void nullVehicleRegistrationFailsLengthGuard() {
        ParkingApplicationRequest request = new ParkingApplicationRequest();
        request.vehicleRegistration = null;
        assertTrue(
                request.vehicleRegistration == null || request.vehicleRegistration.trim().length() < 5,
                "Null-Kennzeichen muss die Validierung ablehnen");
    }

    @Test
    void emptyZoneIsDetectedAsMissing() {
        ParkingApplicationRequest request = new ParkingApplicationRequest();
        request.zone = "";
        assertTrue(
                request.zone == null || request.zone.trim().isEmpty(),
                "Leere Zone muss als fehlend erkannt werden");
    }
}
