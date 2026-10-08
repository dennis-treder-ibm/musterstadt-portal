package com.musterstadt.dto;

import com.musterstadt.model.Application;
import com.musterstadt.model.ParkingPermit;

/** Combines Application + ParkingPermit detail for parking endpoints. */
public class ParkingApplicationDto extends ApplicationDto {

    public String vehicleRegistration;
    public String zone;
    public String proofDocumentPath;

    public static ParkingApplicationDto from(Application app, ParkingPermit permit) {
        ParkingApplicationDto dto = new ParkingApplicationDto();
        // Copy base fields from parent
        dto.id = app.getId();
        if (app.getCitizen() != null) {
            dto.citizenId = app.getCitizen().getId();
            dto.citizenName = app.getCitizen().getFullName();
        }
        dto.type = app.getType() != null ? app.getType().name() : null;
        dto.typeDisplay = app.getTypeDisplay();
        dto.status = app.getStatus() != null ? app.getStatus().name() : null;
        dto.statusDisplay = app.getStatusDisplay();
        dto.createdDate = app.getCreatedDate();
        dto.lastUpdated = app.getLastUpdated();
        dto.notes = app.getNotes();

        // Permit-specific
        if (permit != null) {
            dto.vehicleRegistration = permit.getVehicleRegistration();
            dto.zone = permit.getZone();
            dto.proofDocumentPath = permit.getProofDocumentPath();
        }
        return dto;
    }
}
