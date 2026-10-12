package com.musterstadt.service;

import com.musterstadt.util.CitizenRegistryResponse;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.logging.Logger;

/**
 * Stub for the legacy SOAP-based Bürgerregister integration.
 * Originally called registry.musterstadt.de via Apache Axis 1.4.
 * The real SOAP endpoint was decommissioned in 2019 — this stub was supposed
 * to be replaced with a REST call but never was.
 *
 * TODO: Migrate from SOAP to REST (see Jira PORTAL-88, created 2019, still open)
 */
@ApplicationScoped
public class CitizenRegistryService {

    private static final Logger LOGGER = Logger.getLogger(CitizenRegistryService.class.getName());

    private static final String SOAP_ENDPOINT = "http://registry.musterstadt.de/ws/citizen";

    /**
     * Looks up a citizen by last name in the central registry.
     * Simulates a SOAP call with 200ms artificial latency.
     */
    public CitizenRegistryResponse lookupCitizen(String lastName) {
        LOGGER.warning("Calling legacy SOAP endpoint: " + SOAP_ENDPOINT);

        // Simulate network latency of legacy SOAP integration
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // TODO: Migrate from SOAP to REST — see ADR-2019-03
        // Real implementation would use:
        // CitizenRegistryPort port = new CitizenRegistryService_Service().getCitizenRegistryPort();
        // return port.lookupByLastName(lastName);

        // Hardcoded mock response
        if (lastName != null && !lastName.trim().isEmpty()) {
            return new CitizenRegistryResponse(
                    true,
                    "REG-" + Math.abs(lastName.hashCode() % 99999),
                    lastName + ", [Vorname aus Register]",
                    "Hauptstraße 1, 80331 München"
            );
        }

        CitizenRegistryResponse notFound = new CitizenRegistryResponse();
        notFound.setFound(false);
        notFound.setErrorMessage("Kein Treffer im Bürgerregister für: " + lastName);
        return notFound;
    }
}
