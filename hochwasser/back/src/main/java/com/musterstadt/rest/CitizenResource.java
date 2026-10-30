package com.musterstadt.rest;

import com.musterstadt.dao.CitizenDao;
import com.musterstadt.dto.CitizenDto;
import com.musterstadt.model.Citizen;
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
 * Citizen profile resource.
 *
 * Provides read access to citizen records — used by the dashboard and
 * navigation flows that previously read from the JSF session attribute.
 */
@Path("/api/citizens")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Citizens", description = "Citizen profile lookup")
public class CitizenResource {

    @Inject
    CitizenDao citizenDao;

    @GET
    @Path("/{id}")
    @Operation(summary = "Get citizen by ID",
               description = "Returns the profile of a single citizen.")
    public Response getById(@PathParam("id") Long id) {
        Citizen c = citizenDao.findById(id);
        if (c == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Bürger nicht gefunden: " + id))
                    .build();
        }
        return Response.ok(CitizenDto.from(c)).build();
    }

    @GET
    @Operation(summary = "List all citizens",
               description = "Returns all citizens ordered by last name, first name.")
    public Response listAll() {
        List<Citizen> citizens = citizenDao.findAll();
        List<CitizenDto> dtos = citizens.stream()
                .map(CitizenDto::from)
                .collect(Collectors.toList());
        return Response.ok(dtos).build();
    }
}
