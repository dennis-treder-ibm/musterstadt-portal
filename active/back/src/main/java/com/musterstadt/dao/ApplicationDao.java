package com.musterstadt.dao;

import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationType;
import com.musterstadt.model.Application.ApplicationStatus;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;

@ApplicationScoped
public class ApplicationDao {

    @Inject
    EntityManager em;

    // TODO: Add pagination support
    @SuppressWarnings("unchecked")
    public List<Application> findAll() {
        return em.createQuery(
                "SELECT a FROM Application a JOIN FETCH a.citizen ORDER BY a.createdDate DESC")
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Application> findByCitizenId(Long citizenId) {
        // TODO: Handle null citizen gracefully
        return em.createQuery(
                "SELECT a FROM Application a JOIN FETCH a.citizen WHERE a.citizen.id = :cid ORDER BY a.createdDate DESC")
                .setParameter("cid", citizenId)
                .getResultList();
    }

    // TODO: Replace with named queries
    @SuppressWarnings("unchecked")
    public List<Application> findByType(ApplicationType type) {
        return em.createQuery(
                "SELECT a FROM Application a JOIN FETCH a.citizen WHERE a.type = :type ORDER BY a.createdDate DESC")
                .setParameter("type", type)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Application> findByStatus(ApplicationStatus status) {
        return em.createQuery(
                "SELECT a FROM Application a JOIN FETCH a.citizen WHERE a.status = :status ORDER BY a.createdDate DESC")
                .setParameter("status", status)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Application> findRecentApplications(int maxResults) {
        return em.createQuery(
                "SELECT a FROM Application a JOIN FETCH a.citizen ORDER BY a.createdDate DESC")
                .setMaxResults(maxResults)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Application> findRecentApplicationsByCitizen(Long citizenId, int maxResults) {
        return em.createQuery(
                "SELECT a FROM Application a JOIN FETCH a.citizen WHERE a.citizen.id = :cid ORDER BY a.createdDate DESC")
                .setParameter("cid", citizenId)
                .setMaxResults(maxResults)
                .getResultList();
    }

    @Transactional
    public Application save(Application application) {
        if (application.getId() == null) {
            em.persist(application);
            return application;
        } else {
            return em.merge(application);
        }
    }

    @Transactional
    public Application update(Application application) {
        return em.merge(application);
    }

    public long countAll() {
        return (Long) em.createQuery("SELECT COUNT(a) FROM Application a").getSingleResult();
    }

    public long countByStatus(ApplicationStatus status) {
        return (Long) em.createQuery(
                "SELECT COUNT(a) FROM Application a WHERE a.status = :status")
                .setParameter("status", status)
                .getSingleResult();
    }

    public long countByType(ApplicationType type) {
        return (Long) em.createQuery(
                "SELECT COUNT(a) FROM Application a WHERE a.type = :type")
                .setParameter("type", type)
                .getSingleResult();
    }

    public long countByCitizenAndStatus(Long citizenId, ApplicationStatus status) {
        return (Long) em.createQuery(
                "SELECT COUNT(a) FROM Application a WHERE a.citizen.id = :cid AND a.status = :status")
                .setParameter("cid", citizenId)
                .setParameter("status", status)
                .getSingleResult();
    }

    public long countByCitizenAndType(Long citizenId, ApplicationType type) {
        return (Long) em.createQuery(
                "SELECT COUNT(a) FROM Application a WHERE a.citizen.id = :cid AND a.type = :type")
                .setParameter("cid", citizenId)
                .setParameter("type", type)
                .getSingleResult();
    }
}
