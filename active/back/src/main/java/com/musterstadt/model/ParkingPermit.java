package com.musterstadt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "PARKING_PERMIT")
public class ParkingPermit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "APPLICATION_ID", nullable = false, unique = true)
    private Application application;

    @Column(name = "VEHICLE_REGISTRATION", nullable = false, length = 20)
    private String vehicleRegistration;

    @Column(name = "ZONE", length = 50)
    private String zone;

    @Column(name = "PROOF_DOCUMENT_PATH", length = 500)
    private String proofDocumentPath;

    // Default constructor required by JPA
    public ParkingPermit() {
    }

    public ParkingPermit(Application application, String vehicleRegistration, String zone,
                         String proofDocumentPath) {
        this.application = application;
        this.vehicleRegistration = vehicleRegistration;
        this.zone = zone;
        this.proofDocumentPath = proofDocumentPath;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public String getVehicleRegistration() { return vehicleRegistration; }
    public void setVehicleRegistration(String vehicleRegistration) {
        this.vehicleRegistration = vehicleRegistration;
    }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getProofDocumentPath() { return proofDocumentPath; }
    public void setProofDocumentPath(String proofDocumentPath) {
        this.proofDocumentPath = proofDocumentPath;
    }
}
