package com.musterstadt.rest.dto;

/**
 * Request DTO for POST /api/address/change
 */
public class AddressChangeRequest {
    public String street;
    public String houseNumber;
    public String postcode;
    public String city;
}
