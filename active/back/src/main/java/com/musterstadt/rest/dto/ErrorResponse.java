package com.musterstadt.rest.dto;

/**
 * Generic error response DTO used across all REST endpoints.
 */
public class ErrorResponse {
    public String error;
    public String message;

    public ErrorResponse() {}

    public ErrorResponse(String error, String message) {
        this.error = error;
        this.message = message;
    }
}
