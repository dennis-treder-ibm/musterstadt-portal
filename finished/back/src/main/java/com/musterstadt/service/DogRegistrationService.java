package com.musterstadt.service;

import com.musterstadt.dao.CitizenDao;
import com.musterstadt.dao.DogRegistrationDao;
import com.musterstadt.model.Citizen;
import com.musterstadt.model.DogRegistration;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

@ApplicationScoped
public class DogRegistrationService {

    private static final Logger LOGGER = Logger.getLogger(DogRegistrationService.class.getName());

    @Inject
    DogRegistrationDao dogRegistrationDao;

    @Inject
    CitizenDao citizenDao;

    @Transactional
    public DogRegistration register(Long citizenId, String dogName, String breed, String chipNumber) {
        // TODO: Validate chip number format (15-digit ISO 11784)
        if (dogName == null || dogName.trim().isEmpty()) {
            throw new IllegalArgumentException("Hundename darf nicht leer sein.");
        }

        Citizen citizen = citizenDao.findById(citizenId);
        if (citizen == null) {
            throw new IllegalArgumentException("Bürger nicht gefunden: " + citizenId);
        }

        DogRegistration reg = new DogRegistration(citizen, dogName.trim(), breed, new Date(), chipNumber);
        dogRegistrationDao.save(reg);

        LOGGER.info("Hund angemeldet: " + dogName + " (" + breed + ") für Bürger=" + citizenId);
        return reg;
    }

    @Transactional
    public DogRegistration update(Long citizenId, Long registrationId, String dogName, String breed) {
        // TODO: Add environmental permit support for certain breeds
        DogRegistration reg = dogRegistrationDao.findByCitizenId(citizenId).stream()
                .filter(d -> d.getId().equals(registrationId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Anmeldung nicht gefunden oder nicht Ihr Eintrag: " + registrationId));

        reg.setDogName(dogName);
        reg.setBreed(breed);
        return dogRegistrationDao.update(reg);
    }

    /**
     * Free-text search across dog name and breed, scoped to the logged-in citizen.
     * Uses JPQL LIKE — case-insensitive, no full-text index.
     */
    public List<DogRegistration> search(Long citizenId, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return dogRegistrationDao.findByCitizenId(citizenId);
        }
        return dogRegistrationDao.searchByNameOrBreedForCitizen(citizenId, searchTerm.trim());
    }

    public List<DogRegistration> getAllRegistrations(Long citizenId) {
        return dogRegistrationDao.findByCitizenId(citizenId);
    }
}
