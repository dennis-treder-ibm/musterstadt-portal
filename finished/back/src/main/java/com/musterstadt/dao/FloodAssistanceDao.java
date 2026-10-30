package com.musterstadt.dao;

import com.musterstadt.model.FloodAssistance;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;

@ApplicationScoped
public class FloodAssistanceDao {

    @PersistenceContext(unitName = "BuergerportalPU")
    private EntityManager em;

    public FloodAssistance findByApplicationId(Long applicationId) {
        try {
            return (FloodAssistance) em.createQuery(
                    "SELECT f FROM FloodAssistance f WHERE f.application.id = :appId")
                    .setParameter("appId", applicationId)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<FloodAssistance> findAll() {
        return em.createQuery(
                "SELECT f FROM FloodAssistance f ORDER BY f.id")
                .getResultList();
    }

    @Transactional
    public FloodAssistance save(FloodAssistance floodAssistance) {
        if (floodAssistance.getId() == null) {
            em.persist(floodAssistance);
            return floodAssistance;
        } else {
            return em.merge(floodAssistance);
        }
    }

    public long countByCitizenId(Long citizenId) {
        return (Long) em.createQuery(
                "SELECT COUNT(f) FROM FloodAssistance f WHERE f.application.citizen.id = :cid")
                .setParameter("cid", citizenId)
                .getSingleResult();
    }
}
