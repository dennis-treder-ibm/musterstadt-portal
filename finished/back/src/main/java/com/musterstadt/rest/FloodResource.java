package com.musterstadt.rest;

import com.musterstadt.dto.FloodAssistanceDto;
import com.musterstadt.model.Application;
import com.musterstadt.model.FloodAssistance;
import com.musterstadt.service.FloodAssistanceService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.Context;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Flood assistance resource — mirrors ParkingResource structure.
 *
 * Business rules from hochwasser-feature-plan.md:
 *  - damageDescription required (max 500 chars)
 *  - affectedStreet required
 *  - postcode must be exactly 5 digits (enforced in FloodAssistanceService)
 *  - severityLevel must be LEICHT, MITTEL or SCHWER
 */
@Path("/api/flood")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Flood Assistance", description = "Flood damage assistance applications")
public class FloodResource {

    @Inject
    FloodAssistanceService floodAssistanceService;

    // ── Inner request DTO ────────────────────────────────────────────────────

    public static class CreateFloodRequest {
        public String damageDescription;
        public String affectedStreet;
        public String postcode;
        public String severityLevel;
    }

    // ── Endpoints ───────────────────────────────────────────────────────────

    @GET
    @Path("/{citizenId}/applications")
    @Operation(summary = "List flood assistance applications for a citizen",
               description = "Returns all flood damage assistance applications belonging to the given citizen.")
    public Response getApplications(@PathParam("citizenId") Long citizenId,
                                    @HeaderParam("X-Auth-Token") String token) {
        // TODO: verify token belongs to citizenId
        List<Application> apps = floodAssistanceService.getAllFloodApplications(citizenId);
        List<FloodAssistanceDto> dtos = apps.stream().map(app -> {
            FloodAssistance flood = floodAssistanceService.getFloodForApplication(app.getId());
            return FloodAssistanceDto.from(app, flood);
        }).collect(Collectors.toList());
        return Response.ok(dtos).build();
    }

    @POST
    @Path("/{citizenId}/applications")
    @Operation(summary = "Submit a flood assistance application",
               description = "Creates a new PENDING flood assistance application. " +
                             "damageDescription required (max 500 chars), affectedStreet required, " +
                             "postcode must be 5 digits, severityLevel must be LEICHT, MITTEL or SCHWER.")
    public Response createApplication(@PathParam("citizenId") Long citizenId,
                                      @HeaderParam("X-Auth-Token") String token,
                                      CreateFloodRequest req) {
        if (req == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Request body fehlt."))
                    .build();
        }
        Application app = floodAssistanceService.createApplication(
                citizenId,
                req.damageDescription,
                req.affectedStreet,
                req.postcode,
                req.severityLevel);
        FloodAssistance flood = floodAssistanceService.getFloodForApplication(app.getId());
        return Response.status(Response.Status.CREATED)
                .entity(FloodAssistanceDto.from(app, flood))
                .build();
    }
}
