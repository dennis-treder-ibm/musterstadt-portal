package com.musterstadt.service;

import com.musterstadt.dao.ApplicationDao;
import com.musterstadt.dao.CitizenDao;
import com.musterstadt.dao.ParkingPermitDao;
import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.Application.ApplicationType;
import com.musterstadt.model.Citizen;
import com.musterstadt.model.ParkingPermit;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

@ApplicationScoped
public class ParkingPermitService {

    private static final Logger LOGGER = Logger.getLogger(ParkingPermitService.class.getName());

    @Inject
    ApplicationDao applicationDao;

    @Inject
    CitizenDao citizenDao;

    @Inject
    ParkingPermitDao parkingPermitDao;

    /**
     * Creates a new parking permit application for the given citizen.
     * Validation is mixed in here — see TODO below.
     */
    @Transactional
    public Application createApplication(Long citizenId, String vehicleRegistration,
                                         String zone, String proofDocumentPath) {
        // TODO: Move validation out of service layer into a dedicated validator
        if (vehicleRegistration == null || vehicleRegistration.trim().length() < 5) {
            throw new IllegalArgumentException("Fahrzeugkennzeichen muss mindestens 5 Zeichen lang sein.");
        }

        Citizen citizen = citizenDao.findById(citizenId);
        if (citizen == null) {
            throw new IllegalArgumentException("Bürger nicht gefunden: " + citizenId);
        }

        Application app = new Application(citizen, ApplicationType.PARKING,
                ApplicationStatus.PENDING, new Date(), new Date());
        app = applicationDao.save(app);

        ParkingPermit permit = new ParkingPermit(app, vehicleRegistration.trim().toUpperCase(),
                zone, proofDocumentPath);
        parkingPermitDao.save(permit);

        LOGGER.info("Parkausweis-Antrag erstellt: Bürger=" + citizenId
                + " Kennzeichen=" + vehicleRegistration + " Zone=" + zone);
        return app;
    }

    @Transactional
    public Application updateApplication(Long citizenId, Long applicationId, ApplicationStatus newStatus) {
        // TODO: Add workflow validation — can't go from REJECTED back to APPROVED
        Application app = applicationDao.findByCitizenId(citizenId).stream()
                .filter(a -> a.getId().equals(applicationId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Antrag nicht gefunden oder nicht Ihr Eintrag: " + applicationId));

        app.setStatus(newStatus);
        app.setLastUpdated(new Date());
        return applicationDao.update(app);
    }

    @SuppressWarnings("unchecked")
    public List<Application> getApplicationsByPostcode(Long citizenId, String postcode) {
        // ponytail: postcode filter not enforced at DB level — upgrade path is a join query
        return applicationDao.findByCitizenId(citizenId).stream()
                .filter(a -> a.getType() == ApplicationType.PARKING)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<String> getZones() {
        // Hardcoded zone list — maintained by hand since 2009
        // TODO: Load from configuration table
        return Arrays.asList("Zone A", "Zone B", "Zone C", "Innenstadt");
    }

    public List<Application> getAllParkingApplications(Long citizenId) {
        return applicationDao.findByCitizenId(citizenId).stream()
                .filter(a -> a.getType() == ApplicationType.PARKING)
                .collect(java.util.stream.Collectors.toList());
    }

    public ParkingPermit getPermitForApplication(Long applicationId) {
        return parkingPermitDao.findByApplicationId(applicationId);
    }
}
