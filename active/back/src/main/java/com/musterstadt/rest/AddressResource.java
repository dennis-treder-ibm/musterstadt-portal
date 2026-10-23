package com.musterstadt.rest;

import com.musterstadt.model.Application;
import com.musterstadt.rest.dto.AddressChangeRequest;
import com.musterstadt.rest.dto.ErrorResponse;
import com.musterstadt.service.AddressChangeService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

/**
 * Address change REST resource.
 *
 * Mirrors AddressChangeBean — validates and submits address change applications.
 * Validation rules (from AddressChangeService):
 *  - street must not be blank
 *  - postcode must be exactly 5 characters
 *  - city must not be blank
 *
 * POST /api/address/change       – submit a new address change application
 * GET  /api/address/applications – list all address applications for the citizen
 */
@Path("/api/address")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Address", description = "Address change applications")
public class AddressResource {

    @Inject
    AddressChangeService addressChangeService;

    @POST
    @Path("/change")
    @Operation(
        summary = "Submit an address change application",
        description = "Creates a PENDING address change application. " +
                      "Validation: street required, postcode must be 5 chars, city required."
    )
    public Response submitChange(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId,
            AddressChangeRequest request) {

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

        // Mirror inline validation from AddressChangeBean.validateAndSubmit()
        if (request.street == null || request.street.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Straße darf nicht leer sein."))
                    .build();
        }

        if (request.postcode == null || request.postcode.length() != 5) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Postleitzahl ungültig"))
                    .build();
        }

        if (request.city == null || request.city.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("VALIDATION_ERROR", "Ort darf nicht leer sein."))
                    .build();
        }

        try {
            Application app = addressChangeService.submitChange(
                    citizenId, request.street, request.houseNumber, request.postcode, request.city);
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
        summary = "List all address change applications for the citizen",
        description = "Returns all ADDRESS-type applications for the authenticated citizen, newest first."
    )
    public Response getApplications(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        List<Application> applications = addressChangeService.getAllAddressApplications(citizenId);
        return Response.ok(applications).build();
    }
}
