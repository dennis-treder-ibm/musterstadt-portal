package com.musterstadt.rest.dto;

/**
 * Response DTO for POST /api/auth/login
 */
public class LoginResponse {
    public boolean success;
    public String message;
    public Long citizenId;
    public String username;

    public LoginResponse() {}

    public LoginResponse(boolean success, String message, Long citizenId, String username) {
        this.success = success;
        this.message = message;
        this.citizenId = citizenId;
        this.username = username;
    }
}
