package com.musterstadt.rest;

import com.musterstadt.dto.ApplicationDto;
import com.musterstadt.model.Application;
import com.musterstadt.service.AddressChangeService;
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
 * Address change resource — mirrors AddressChangeBean (RequestScoped in legacy).
 *
 * Business rules preserved from architecture.md §4.3:
 *  - street required
 *  - postcode must be exactly 5 chars (length check only — TODO: regex ^\d{5}$)
 *  - city required
 *  - new address stored in APPLICATION.NOTES; citizen record NOT updated until approved
 */
@Path("/api/address")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Address Changes", description = "Address change notification applications")
public class AddressResource {

    @Inject
    AddressChangeService addressChangeService;

    // ── DTOs ────────────────────────────────────────────────────────────────

    public static class AddressChangeRequest {
        public String street;
        public String houseNumber;
        public String postcode;
        public String city;
    }

    // ── Endpoints ───────────────────────────────────────────────────────────

    @GET
    @Path("/{citizenId}/applications")
    @Operation(summary = "List address change applications for a citizen",
               description = "Returns all address change applications belonging to the given citizen.")
    public Response getApplications(@PathParam("citizenId") Long citizenId) {
        List<Application> apps = addressChangeService.getAllAddressApplications(citizenId);
        List<ApplicationDto> dtos = apps.stream()
                .map(ApplicationDto::from)
                .collect(Collectors.toList());
        return Response.ok(dtos).build();
    }

    @POST
    @Path("/{citizenId}/applications")
    @Operation(summary = "Submit an address change notification",
               description = "Creates a new PENDING address change application. " +
                             "street and city are required; postcode must be exactly 5 characters.")
    public Response submitChange(@PathParam("citizenId") Long citizenId,
                                 AddressChangeRequest req) {
        if (req == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Request body fehlt."))
                    .build();
        }
        // City required — was validated in AddressChangeBean (inline only)
        if (req.city == null || req.city.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Stadt ist erforderlich."))
                    .build();
        }
        Application app = addressChangeService.submitChange(
                citizenId, req.street, req.houseNumber, req.postcode, req.city);
        return Response.status(Response.Status.CREATED)
                .entity(ApplicationDto.from(app))
                .build();
    }
}
