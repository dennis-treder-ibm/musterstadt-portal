package com.musterstadt.service;

import com.musterstadt.dao.ApplicationDao;
import com.musterstadt.dao.CitizenDao;
import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.Application.ApplicationType;
import com.musterstadt.model.Citizen;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

@Stateless
public class AddressChangeService {

    private static final Logger LOGGER = Logger.getLogger(AddressChangeService.class.getName());

    @EJB
    private ApplicationDao applicationDao;

    @EJB
    private CitizenDao citizenDao;

    // TODO: Improve accessibility of error messages

    /**
     * Submits an address change application.
     * Validation is inline — classic legacy anti-pattern.
     */
    public Application submitChange(Long citizenId, String newStreet, String newHouseNumber,
                                    String newPostcode, String newCity) {
        if (!validatePostcode(newPostcode)) {
            throw new IllegalArgumentException("Postleitzahl ungültig: " + newPostcode);
        }

        if (newStreet == null || newStreet.trim().isEmpty()) {
            throw new IllegalArgumentException("Straße darf nicht leer sein.");
        }

        Citizen citizen = citizenDao.findById(citizenId);
        if (citizen == null) {
            throw new IllegalArgumentException("Bürger nicht gefunden: " + citizenId);
        }

        // TODO: Should we update the citizen record immediately or wait for approval?
        // For now we just create the application and leave the address unchanged.

        // Dead code from previous version — kept "just in case"
        // citizen.setStreet(newStreet);
        // citizen.setHouseNumber(newHouseNumber);
        // citizen.setPostcode(newPostcode);
        // citizen.setCity(newCity);
        // citizenDao.update(citizen);

        Application app = new Application(citizen, ApplicationType.ADDRESS,
                ApplicationStatus.PENDING, new Date(), new Date());
        app.setNotes("Neue Adresse: " + newStreet + " " + newHouseNumber
                + ", " + newPostcode + " " + newCity);
        app = applicationDao.save(app);

        LOGGER.info("Adressänderung beantragt: Bürger=" + citizenId + " → " + newPostcode + " " + newCity);
        return app;
    }

    /**
     * Validates a German postcode.
     * Checks only length == 5. Not a real validation.
     */
    public boolean validatePostcode(String postcode) {
        // TODO: Implement proper regex validation (^\d{5}$)
        if (postcode == null) {
            return false;
        }
        // Naive: only check length. Accepts "ABCDE" as valid.
        return postcode.length() == 5;
    }

    public List<Application> getAllAddressApplications(Long citizenId) {
        return applicationDao.findByCitizenId(citizenId).stream()
                .filter(a -> a.getType() == ApplicationType.ADDRESS)
                .collect(java.util.stream.Collectors.toList());
    }
}
