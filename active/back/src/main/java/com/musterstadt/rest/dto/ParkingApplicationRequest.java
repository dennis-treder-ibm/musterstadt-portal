package com.musterstadt.rest.dto;

/**
 * Request DTO for POST /api/parking/applications
 */
public class ParkingApplicationRequest {
    public String vehicleRegistration;
    public String zone;
    public String proofDocumentPath;
}
