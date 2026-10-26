package com.musterstadt.dao;

import com.musterstadt.model.ParkingPermit;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class ParkingPermitDao {

    @PersistenceContext(unitName = "BuergerportalPU")
    private EntityManager em;

    // TODO: Replace with named queries
    public ParkingPermit findByApplicationId(Long applicationId) {
        try {
            return (ParkingPermit) em.createQuery(
                    "SELECT p FROM ParkingPermit p WHERE p.application.id = :appId")
                    .setParameter("appId", applicationId)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    // TODO: Add pagination support
    @SuppressWarnings("unchecked")
    public List<ParkingPermit> findByZone(String zone) {
        return em.createQuery(
                "SELECT p FROM ParkingPermit p WHERE p.zone = :zone")
                .setParameter("zone", zone)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<ParkingPermit> findAll() {
        return em.createQuery(
                "SELECT p FROM ParkingPermit p ORDER BY p.id")
                .getResultList();
    }

    public ParkingPermit save(ParkingPermit permit) {
        if (permit.getId() == null) {
            em.persist(permit);
            return permit;
        } else {
            return em.merge(permit);
        }
    }

    public ParkingPermit update(ParkingPermit permit) {
        return em.merge(permit);
    }

    public long countAll() {
        return (Long) em.createQuery("SELECT COUNT(p) FROM ParkingPermit p").getSingleResult();
    }

    public long countByCitizenId(Long citizenId) {
        return (Long) em.createQuery(
                "SELECT COUNT(p) FROM ParkingPermit p WHERE p.application.citizen.id = :cid")
                .setParameter("cid", citizenId)
                .getSingleResult();
    }
}
