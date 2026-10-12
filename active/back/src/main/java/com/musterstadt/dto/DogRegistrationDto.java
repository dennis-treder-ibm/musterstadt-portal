package com.musterstadt.dto;

import com.musterstadt.model.DogRegistration;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** Read-only view of a DogRegistration entity. */
public class DogRegistrationDto {

    public Long id;
    public Long citizenId;
    public String citizenName;
    public String dogName;
    public String breed;
    public String chipNumber;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    public Date registrationDate;

    public static DogRegistrationDto from(DogRegistration d) {
        DogRegistrationDto dto = new DogRegistrationDto();
        dto.id = d.getId();
        if (d.getCitizen() != null) {
            dto.citizenId = d.getCitizen().getId();
            dto.citizenName = d.getCitizen().getFullName();
        }
        dto.dogName = d.getDogName();
        dto.breed = d.getBreed();
        dto.chipNumber = d.getChipNumber();
        dto.registrationDate = d.getRegistrationDate();
        return dto;
    }
}
