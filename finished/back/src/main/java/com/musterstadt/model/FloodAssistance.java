package com.musterstadt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "FLOOD_ASSISTANCE")
public class FloodAssistance {

    public enum SeverityLevel {
        LEICHT, MITTEL, SCHWER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "APPLICATION_ID", nullable = false, unique = true)
    private Application application;

    @Column(name = "DAMAGE_DESCRIPTION", nullable = false, length = 500)
    private String damageDescription;

    @Column(name = "AFFECTED_STREET", nullable = false, length = 200)
    private String affectedStreet;

    @Column(name = "POSTCODE", nullable = false, length = 5)
    private String postcode;

    @Enumerated(EnumType.STRING)
    @Column(name = "SEVERITY_LEVEL", nullable = false, length = 10)
    private SeverityLevel severityLevel;

    // Default constructor required by JPA
    public FloodAssistance() {
    }

    public FloodAssistance(Application application, String damageDescription,
                           String affectedStreet, String postcode, SeverityLevel severityLevel) {
        this.application = application;
        this.damageDescription = damageDescription;
        this.affectedStreet = affectedStreet;
        this.postcode = postcode;
        this.severityLevel = severityLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public String getDamageDescription() { return damageDescription; }
    public void setDamageDescription(String damageDescription) { this.damageDescription = damageDescription; }

    public String getAffectedStreet() { return affectedStreet; }
    public void setAffectedStreet(String affectedStreet) { this.affectedStreet = affectedStreet; }

    public String getPostcode() { return postcode; }
    public void setPostcode(String postcode) { this.postcode = postcode; }

    public SeverityLevel getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(SeverityLevel severityLevel) { this.severityLevel = severityLevel; }
}
