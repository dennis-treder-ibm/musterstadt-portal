package com.musterstadt.service;

import com.musterstadt.dao.ApplicationDao;
import com.musterstadt.dao.CitizenDao;
import com.musterstadt.dao.FloodAssistanceDao;
import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.Application.ApplicationType;
import com.musterstadt.model.Citizen;
import com.musterstadt.model.FloodAssistance;
import com.musterstadt.model.FloodAssistance.SeverityLevel;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

@ApplicationScoped
public class FloodAssistanceService {

    private static final Logger LOGGER = Logger.getLogger(FloodAssistanceService.class.getName());

    @Inject
    ApplicationDao applicationDao;

    @Inject
    CitizenDao citizenDao;

    @Inject
    FloodAssistanceDao floodAssistanceDao;

    @Transactional
    public Application createApplication(Long citizenId, String damageDescription,
                                         String affectedStreet, String postcode,
                                         String severityLevelStr) {
        // Validate damage description
        if (damageDescription == null || damageDescription.trim().isEmpty()) {
            throw new IllegalArgumentException("Schadensbeschreibung darf nicht leer sein.");
        }
        if (damageDescription.trim().length() > 500) {
            throw new IllegalArgumentException("Schadensbeschreibung darf maximal 500 Zeichen lang sein.");
        }

        // Validate affected street
        if (affectedStreet == null || affectedStreet.trim().isEmpty()) {
            throw new IllegalArgumentException("Betroffene Straße darf nicht leer sein.");
        }

        // Validate postcode (exactly 5 digits)
        if (postcode == null || !postcode.trim().matches("^\\d{5}$")) {
            throw new IllegalArgumentException("Postleitzahl muss genau 5 Ziffern enthalten.");
        }

        // Validate severity level
        SeverityLevel severityLevel;
        try {
            severityLevel = SeverityLevel.valueOf(severityLevelStr);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Schweregrad muss LEICHT, MITTEL oder SCHWER sein.");
        }

        Citizen citizen = citizenDao.findById(citizenId);
        if (citizen == null) {
            throw new IllegalArgumentException("Bürger nicht gefunden: " + citizenId);
        }

        Application app = new Application(citizen, ApplicationType.FLOOD,
                ApplicationStatus.PENDING, new Date(), new Date());
        app = applicationDao.save(app);

        FloodAssistance flood = new FloodAssistance(app, damageDescription.trim(),
                affectedStreet.trim(), postcode.trim(), severityLevel);
        floodAssistanceDao.save(flood);

        LOGGER.info("Hochwasserhilfe-Antrag erstellt: appId=" + app.getId()
                + " buerger=" + citizenId
                + " strasse=" + affectedStreet
                + " beschreibung=" + damageDescription
                + " schweregrad=" + severityLevel);
        return app;
    }

    public List<Application> getAllFloodApplications(Long citizenId) {
        return applicationDao.findByCitizenId(citizenId).stream()
                .filter(a -> a.getType() == ApplicationType.FLOOD)
                .collect(java.util.stream.Collectors.toList());
    }

    public FloodAssistance getFloodForApplication(Long applicationId) {
        return floodAssistanceDao.findByApplicationId(applicationId);
    }
}
