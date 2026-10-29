package com.musterstadt.dto;

import com.musterstadt.model.Citizen;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/** Read-only view of a Citizen entity. */
public class CitizenDto {

    public Long id;
    public String firstName;
    public String lastName;
    public String fullName;
    public String street;
    public String houseNumber;
    public String postcode;
    public String city;
    public String email;
    public String phone;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    public Date registeredDate;

    public static CitizenDto from(Citizen c) {
        CitizenDto dto = new CitizenDto();
        dto.id = c.getId();
        dto.firstName = c.getFirstName();
        dto.lastName = c.getLastName();
        dto.fullName = c.getFullName();
        dto.street = c.getStreet();
        dto.houseNumber = c.getHouseNumber();
        dto.postcode = c.getPostcode();
        dto.city = c.getCity();
        dto.email = c.getEmail();
        dto.phone = c.getPhone();
        dto.registeredDate = c.getRegisteredDate();
        return dto;
    }
}
