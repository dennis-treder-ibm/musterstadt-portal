package com.musterstadt.dto;

import com.musterstadt.model.Application;
import com.musterstadt.model.FloodAssistance;

/** Combines Application + FloodAssistance detail for flood endpoints. */
public class FloodAssistanceDto extends ApplicationDto {

    public String damageDescription;
    public String affectedStreet;
    public String postcode;
    public String severityLevel;

    public static FloodAssistanceDto from(Application app, FloodAssistance flood) {
        FloodAssistanceDto dto = new FloodAssistanceDto();
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

        // Flood-specific
        if (flood != null) {
            dto.damageDescription = flood.getDamageDescription();
            dto.affectedStreet = flood.getAffectedStreet();
            dto.postcode = flood.getPostcode();
            dto.severityLevel = flood.getSeverityLevel() != null ? flood.getSeverityLevel().name() : null;
        }
        return dto;
    }
}
