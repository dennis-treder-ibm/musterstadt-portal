package com.musterstadt.dto;

import com.musterstadt.model.Application;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** Read-only view of an Application entity sent over the wire. */
public class ApplicationDto {

    public Long id;
    public Long citizenId;
    public String citizenName;
    public String type;
    public String typeDisplay;
    public String status;
    public String statusDisplay;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    public Date createdDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    public Date lastUpdated;

    public String notes;

    public static ApplicationDto from(Application a) {
        ApplicationDto dto = new ApplicationDto();
        dto.id = a.getId();
        if (a.getCitizen() != null) {
            dto.citizenId = a.getCitizen().getId();
            dto.citizenName = a.getCitizen().getFullName();
        }
        dto.type = a.getType() != null ? a.getType().name() : null;
        dto.typeDisplay = a.getTypeDisplay();
        dto.status = a.getStatus() != null ? a.getStatus().name() : null;
        dto.statusDisplay = a.getStatusDisplay();
        dto.createdDate = a.getCreatedDate();
        dto.lastUpdated = a.getLastUpdated();
        dto.notes = a.getNotes();
        return dto;
    }
}
