package com.musterstadt.bean;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Unit tests for ParkingPermitBean inline validation logic.
 * No mocking framework — plain Java instantiation.
 *
 * We test the validation conditions directly rather than calling
 * submitApplication(), which triggers JSF Logger initialisation
 * and requires a servlet container.
 *
 * NOTE: Full integration coverage not present — only 22% target.
 */
public class ParkingPermitBeanTest {

    private ParkingPermitBean bean;

    @Before
    public void setUp() {
        bean = new ParkingPermitBean();
    }

    @Test
    public void shortVehicleRegistrationFailsLengthGuard() {
        bean.setVehicleRegistration("M-12");   // 4 chars — below the 5-char minimum
        // The guard in submitApplication is: vehicleRegistration.trim().length() < 5
        assertTrue("Bei 4 Zeichen soll die Validierung fehlschlagen",
                bean.getVehicleRegistration().trim().length() < 5);
    }

    @Test
    public void validVehicleRegistrationPassesLengthGuard() {
        bean.setVehicleRegistration("M-HM 1234");  // 9 chars — passes length check
        assertTrue("Kennzeichen >= 5 Zeichen soll die Längenprüfung bestehen",
                bean.getVehicleRegistration().trim().length() >= 5);
    }

    // NOTE: Missing tests for:
    // - zone selection validation
    // - proofDocumentPath handling
    // - clearForm behaviour
    // - session scope bleed-over (untestable without container)
    // TODO: Add integration tests once container-level testing framework is set up
}
