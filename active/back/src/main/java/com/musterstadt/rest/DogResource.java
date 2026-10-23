package com.musterstadt.rest;

import com.musterstadt.model.DogRegistration;
import com.musterstadt.rest.dto.DogRegistrationRequest;
import com.musterstadt.rest.dto.DogUpdateRequest;
import com.musterstadt.rest.dto.ErrorResponse;
import com.musterstadt.service.DogRegistrationService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
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
 * Dog registration REST resource.
 *
 * Mirrors DogRegistrationBean — register, list, search and update dog registrations.
 * Validation rules (from DogRegistrationService):
 *  - dogName must not be blank
 *  - citizenId must correspond to an existing citizen
 *
 * POST /api/dogs              – register a new dog
 * GET  /api/dogs              – list all registrations for the citizen
 * GET  /api/dogs/search       – search registrations by name or breed (query param: q)
 * PUT  /api/dogs/{id}         – update an existing dog registration
 */
@Path("/api/dogs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Dog Registrations", description = "Dog registration management")
public class DogResource {

    @Inject
    DogRegistrationService dogRegistrationService;

    @POST
    @Operation(
        summary = "Register a new dog",
        description = "Creates a dog registration entry for the authenticated citizen. dogName is required."
    )
    public Response register(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            DogRegistrationRequest request) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        if (request == null || request.dogName == null || request.dogName.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Hundename darf nicht leer sein."))
                    .build();
        }

        try {
            DogRegistration reg = dogRegistrationService.register(
                    citizenId, request.dogName, request.breed, request.chipNumber);
            return Response.status(Response.Status.CREATED).entity(reg).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Operation(
        summary = "List all dog registrations for the citizen",
        description = "Returns all dogs registered by the authenticated citizen."
    )
    public Response getAll(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        List<DogRegistration> registrations = dogRegistrationService.getAllRegistrations(citizenId);
        return Response.ok(registrations).build();
    }

    @GET
    @Path("/search")
    @Operation(
        summary = "Search dog registrations by name or breed",
        description = "Case-insensitive LIKE search across dogName and breed. " +
                      "Pass search term via query parameter 'q'. Returns all registrations if q is empty."
    )
    public Response search(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            @Parameter(description = "Search term (matched against dog name and breed)")
            @QueryParam("q") String searchTerm) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        List<DogRegistration> results = dogRegistrationService.search(citizenId, searchTerm);
        return Response.ok(results).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(
        summary = "Update an existing dog registration",
        description = "Updates dogName and breed for a registration that belongs to the authenticated citizen."
    )
    public Response update(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            @Parameter(description = "Dog registration ID") @PathParam("id") Long id,
            DogUpdateRequest request) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        if (request == null || request.dogName == null || request.dogName.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Hundename darf nicht leer sein."))
                    .build();
        }

        try {
            DogRegistration updated = dogRegistrationService.update(citizenId, id, request.dogName, request.breed);
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("NOT_FOUND", e.getMessage()))
                    .build();
        }
    }
}
