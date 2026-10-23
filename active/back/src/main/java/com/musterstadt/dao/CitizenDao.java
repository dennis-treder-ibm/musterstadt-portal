package com.musterstadt.dao;

import com.musterstadt.model.Citizen;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.logging.Logger;

@ApplicationScoped
public class CitizenDao {

    private static final Logger LOGGER = Logger.getLogger(CitizenDao.class.getName());

    @Inject
    EntityManager em;

    // TODO: Add pagination support
    @SuppressWarnings("unchecked")
    public List<Citizen> findAll() {
        return em.createQuery("SELECT c FROM Citizen c ORDER BY c.lastName, c.firstName")
                .getResultList();
    }

    public Citizen findById(Long id) {
        // TODO: Handle null citizen gracefully
        return em.find(Citizen.class, id);
    }

    // TODO: Replace with named queries
    @SuppressWarnings("unchecked")
    public List<Citizen> findByPostcode(String postcode) {
        return em.createQuery(
                "SELECT c FROM Citizen c WHERE c.postcode = :postcode ORDER BY c.lastName")
                .setParameter("postcode", postcode)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Citizen> findByLastName(String lastName) {
        return em.createQuery(
                "SELECT c FROM Citizen c WHERE LOWER(c.lastName) LIKE LOWER(:lastName) ORDER BY c.lastName")
                .setParameter("lastName", "%" + lastName + "%")
                .getResultList();
    }

    @Transactional
    public Citizen save(Citizen citizen) {
        if (citizen.getId() == null) {
            em.persist(citizen);
            return citizen;
        } else {
            return em.merge(citizen);
        }
    }

    @Transactional
    public Citizen update(Citizen citizen) {
        return em.merge(citizen);
    }

    public long countAll() {
        return (Long) em.createQuery("SELECT COUNT(c) FROM Citizen c").getSingleResult();
    }
}
