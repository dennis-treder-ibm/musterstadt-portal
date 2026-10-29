package com.musterstadt.util;

/**
 * Mock response object that mimics what a real SOAP CXF-generated stub would return.
 * In a real system this would be a JAXB-annotated generated class from the WSDL.
 *
 * TODO: Replace with actual JAXB-generated type from registry.musterstadt.de WSDL
 */
public class CitizenRegistryResponse {

    private boolean found;
    private String citizenId;
    private String fullName;
    private String verifiedAddress;
    private String errorMessage;

    public CitizenRegistryResponse() {
    }

    public CitizenRegistryResponse(boolean found, String citizenId, String fullName,
                                   String verifiedAddress) {
        this.found = found;
        this.citizenId = citizenId;
        this.fullName = fullName;
        this.verifiedAddress = verifiedAddress;
    }

    public boolean isFound() { return found; }
    public void setFound(boolean found) { this.found = found; }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getVerifiedAddress() { return verifiedAddress; }
    public void setVerifiedAddress(String verifiedAddress) { this.verifiedAddress = verifiedAddress; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
