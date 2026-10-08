package com.musterstadt.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "APPLICATION")
public class Application {

    public enum ApplicationType {
        PARKING, ADDRESS, DOG
    }

    public enum ApplicationStatus {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CITIZEN_ID", nullable = false)
    private Citizen citizen;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 20)
    private ApplicationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private ApplicationStatus status;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "CREATED_DATE", nullable = false)
    private Date createdDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "LAST_UPDATED")
    private Date lastUpdated;

    @Column(name = "NOTES", length = 500)
    private String notes;

    // Default constructor required by JPA
    public Application() {
    }

    public Application(Citizen citizen, ApplicationType type, ApplicationStatus status,
                       Date createdDate, Date lastUpdated) {
        this.citizen = citizen;
        this.type = type;
        this.status = status;
        this.createdDate = createdDate;
        this.lastUpdated = lastUpdated;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Citizen getCitizen() { return citizen; }
    public void setCitizen(Citizen citizen) { this.citizen = citizen; }

    public ApplicationType getType() { return type; }
    public void setType(ApplicationType type) { this.type = type; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }

    public Date getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Date lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatusDisplay() {
        if (status == null) return "";
        switch (status) {
            case PENDING: return "Ausstehend";
            case APPROVED: return "Genehmigt";
            case REJECTED: return "Abgelehnt";
            default: return status.name();
        }
    }

    public String getTypeDisplay() {
        if (type == null) return "";
        switch (type) {
            case PARKING: return "Parkausweis";
            case ADDRESS: return "Adressänderung";
            case DOG: return "Hundeanmeldung";
            default: return type.name();
        }
    }
}
