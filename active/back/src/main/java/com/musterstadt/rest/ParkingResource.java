package com.musterstadt.rest;

import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.ParkingPermit;
import com.musterstadt.rest.dto.ErrorResponse;
import com.musterstadt.rest.dto.ParkingApplicationRequest;
import com.musterstadt.service.ParkingPermitService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

/**
 * Parking permit REST resource.
 *
 * Mirrors ParkingPermitBean — submit, list, and manage parking permit applications.
 * Validation rules (from ParkingPermitService):
 *  - vehicleRegistration must be at least 5 characters
 *  - zone must not be blank
 *  - citizenId must correspond to an existing citizen
 *
 * POST  /api/parking/applications            – submit a new parking application
 * GET   /api/parking/applications            – list all parking applications for the citizen
 * GET   /api/parking/applications/{id}/permit – get the permit for a specific application
 * PATCH /api/parking/applications/{id}/status – update application status
 * GET   /api/parking/zones                   – list available parking zones
 */
@Path("/api/parking")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Parking Permits", description = "Parking permit application management")
public class ParkingResource {

    @Inject
    ParkingPermitService parkingPermitService;

    @POST
    @Path("/applications")
    @Operation(
        summary = "Submit a parking permit application",
        description = "Creates a PENDING parking permit application. " +
                      "Validation: vehicleRegistration min 5 chars, zone required."
    )
    public Response submitApplication(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            ParkingApplicationRequest request) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        if (request == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("BAD_REQUEST", "Request-Body fehlt."))
                    .build();
        }

        // Mirror inline validation from ParkingPermitBean.submitApplication()
        if (request.vehicleRegistration == null || request.vehicleRegistration.trim().length() < 5) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Fahrzeugkennzeichen muss mindestens 5 Zeichen lang sein."))
                    .build();
        }

        if (request.zone == null || request.zone.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Bitte wählen Sie eine Parkzone aus."))
                    .build();
        }

        try {
            Application app = parkingPermitService.createApplication(
                    citizenId, request.vehicleRegistration, request.zone, request.proofDocumentPath);
            return Response.status(Response.Status.CREATED).entity(app).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/applications")
    @Operation(
        summary = "List all parking applications for the citizen",
        description = "Returns all PARKING-type applications for the authenticated citizen, newest first."
    )
    public Response getApplications(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        List<Application> applications = parkingPermitService.getAllParkingApplications(citizenId);
        return Response.ok(applications).build();
    }

    @GET
    @Path("/applications/{id}/permit")
    @Operation(
        summary = "Get the parking permit for an application",
        description = "Returns the ParkingPermit entity associated with the given application ID."
    )
    public Response getPermit(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            @Parameter(description = "Application ID") @PathParam("id") Long applicationId) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        ParkingPermit permit = parkingPermitService.getPermitForApplication(applicationId);
        if (permit == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("NOT_FOUND", "Kein Parkausweis für Antrag " + applicationId + " gefunden."))
                    .build();
        }
        return Response.ok(permit).build();
    }

    @PATCH
    @Path("/applications/{id}/status")
    @Operation(
        summary = "Update the status of a parking application",
        description = "Changes the status of the application. Allowed values: PENDING, APPROVED, REJECTED."
    )
    public Response updateStatus(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            @Parameter(description = "Application ID") @PathParam("id") Long applicationId,
            @Parameter(description = "New status string query parameter") @QueryParam("status") String status) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(status);
        } catch (IllegalArgumentException | NullPointerException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("BAD_REQUEST", "Ungültiger Status. Erlaubt: PENDING, APPROVED, REJECTED"))
                    .build();
        }

        try {
            Application updated = parkingPermitService.updateApplication(citizenId, applicationId, newStatus);
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("NOT_FOUND", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/zones")
    @Operation(
        summary = "List available parking zones",
        description = "Returns the hardcoded list of parking zones: Zone A, Zone B, Zone C, Innenstadt."
    )
    public Response getZones() {
        return Response.ok(parkingPermitService.getZones()).build();
    }
}
