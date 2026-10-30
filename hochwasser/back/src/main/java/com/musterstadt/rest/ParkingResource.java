package com.musterstadt.rest;

import com.musterstadt.dto.ParkingApplicationDto;
import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.ParkingPermit;
import com.musterstadt.service.ParkingPermitService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Parking permit resource — mirrors ParkingPermitBean (SessionScoped in legacy).
 *
 * Business rules preserved from architecture.md §4.2:
 *  - vehicleRegistration ≥ 5 chars (enforced in ParkingPermitService)
 *  - zone required (enforced here, as it was in ParkingPermitBean)
 *  - vehicleRegistration normalised to UPPERCASE (enforced in ParkingPermitService)
 *  - zones: Zone A, Zone B, Zone C, Innenstadt
 */
@Path("/api/parking")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Parking Permits", description = "Parking permit applications")
public class ParkingResource {

    @Inject
    ParkingPermitService parkingPermitService;

    // ── DTOs ────────────────────────────────────────────────────────────────

    public static class CreateParkingRequest {
        public String vehicleRegistration;
        public String zone;
        public String proofDocumentPath;
    }

    public static class UpdateStatusRequest {
        public String status;
    }

    // ── Endpoints ───────────────────────────────────────────────────────────

    @GET
    @Path("/zones")
    @Operation(summary = "Get available parking zones",
               description = "Returns the hardcoded list of parking zones (Zone A, Zone B, Zone C, Innenstadt).")
    public Response getZones() {
        return Response.ok(parkingPermitService.getZones()).build();
    }

    @GET
    @Path("/{citizenId}/applications")
    @Operation(summary = "List parking applications for a citizen",
               description = "Returns all parking permit applications belonging to the given citizen.")
    public Response getApplications(@PathParam("citizenId") Long citizenId) {
        List<Application> apps = parkingPermitService.getAllParkingApplications(citizenId);
        List<ParkingApplicationDto> dtos = apps.stream().map(app -> {
            ParkingPermit permit = parkingPermitService.getPermitForApplication(app.getId());
            return ParkingApplicationDto.from(app, permit);
        }).collect(Collectors.toList());
        return Response.ok(dtos).build();
    }

    @POST
    @Path("/{citizenId}/applications")
    @Operation(summary = "Submit a parking permit application",
               description = "Creates a new PENDING parking permit application. " +
                             "vehicleRegistration must be ≥ 5 chars; zone must be non-empty.")
    public Response createApplication(@PathParam("citizenId") Long citizenId,
                                      CreateParkingRequest req) {
        if (req == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Request body fehlt."))
                    .build();
        }
        // Zone required — was validated in ParkingPermitBean (inline)
        if (req.zone == null || req.zone.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Zone ist erforderlich."))
                    .build();
        }
        Application app = parkingPermitService.createApplication(
                citizenId, req.vehicleRegistration, req.zone, req.proofDocumentPath);
        ParkingPermit permit = parkingPermitService.getPermitForApplication(app.getId());
        return Response.status(Response.Status.CREATED)
                .entity(ParkingApplicationDto.from(app, permit))
                .build();
    }

    @PUT
    @Path("/{citizenId}/applications/{applicationId}/status")
    @Operation(summary = "Update application status",
               description = "Updates the status of a parking application. Valid values: PENDING, APPROVED, REJECTED.")
    public Response updateStatus(@PathParam("citizenId") Long citizenId,
                                 @PathParam("applicationId") Long applicationId,
                                 UpdateStatusRequest req) {
        if (req == null || req.status == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Status fehlt."))
                    .build();
        }
        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(req.status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Ungültiger Status: " + req.status))
                    .build();
        }
        Application updated = parkingPermitService.updateApplication(citizenId, applicationId, newStatus);
        ParkingPermit permit = parkingPermitService.getPermitForApplication(updated.getId());
        return Response.ok(ParkingApplicationDto.from(updated, permit)).build();
    }
}
