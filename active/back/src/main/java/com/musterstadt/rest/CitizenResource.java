package com.musterstadt.rest;

import com.musterstadt.model.Citizen;
import com.musterstadt.rest.dto.ErrorResponse;
import com.musterstadt.service.CitizenRegistryService;
import com.musterstadt.dao.CitizenDao;
import com.musterstadt.util.CitizenRegistryResponse;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Citizen REST resource.
 *
 * Exposes citizen lookup from the local database and from the legacy SOAP stub
 * (CitizenRegistryService).
 *
 * GET /api/citizens/{id}         – get a single citizen by database ID
 * GET /api/citizens/registry     – lookup citizen in the legacy citizen registry by lastName
 */
@Path("/api/citizens")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Citizens", description = "Citizen data access")
public class CitizenResource {

    @Inject
    CitizenDao citizenDao;

    @Inject
    CitizenRegistryService citizenRegistryService;

    @GET
    @Path("/{id}")
    @Operation(
        summary = "Get a citizen by ID",
        description = "Looks up a citizen from the local database by their numeric ID."
    )
    public Response getById(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long requestingCitizenId,
            @Parameter(description = "ID of the citizen to retrieve") @PathParam("id") Long id) {

        if (requestingCitizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        Citizen citizen = citizenDao.findById(id);
        if (citizen == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("NOT_FOUND", "Bürger nicht gefunden: " + id))
                    .build();
        }
        return Response.ok(citizen).build();
    }

    @GET
    @Path("/registry")
    @Operation(
        summary = "Lookup citizen in the legacy citizen registry",
        description = "Delegates to the legacy SOAP stub (CitizenRegistryService). " +
                      "Simulates 200ms latency. Pass lastName as query parameter."
    )
    public Response lookupRegistry(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long requestingCitizenId,
            @Parameter(description = "Last name to search for in the registry")
            @QueryParam("lastName") String lastName) {

        if (requestingCitizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        if (lastName == null || lastName.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("BAD_REQUEST", "lastName query-Parameter fehlt."))
                    .build();
        }

        CitizenRegistryResponse registryResponse = citizenRegistryService.lookupCitizen(lastName);
        if (!registryResponse.isFound()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(registryResponse)
                    .build();
        }
        return Response.ok(registryResponse).build();
    }
}
