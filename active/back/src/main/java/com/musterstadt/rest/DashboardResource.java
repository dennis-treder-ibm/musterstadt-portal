package com.musterstadt.rest;

import com.musterstadt.dao.ApplicationDao;
import com.musterstadt.dao.DogRegistrationDao;
import com.musterstadt.dao.ParkingPermitDao;
import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.Application.ApplicationType;
import com.musterstadt.rest.dto.DashboardSummaryResponse;
import com.musterstadt.rest.dto.DashboardSummaryResponse.RecentActivityItem;
import com.musterstadt.rest.dto.ErrorResponse;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Dashboard REST resource.
 *
 * Mirrors DashboardBean — provides aggregate statistics for the authenticated citizen.
 * The citizen is identified by the X-Citizen-Id header (demo auth, not production-safe).
 *
 * GET /api/dashboard/summary – returns counts and recent activity
 */
@Path("/api/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Dashboard", description = "Citizen dashboard summary statistics")
public class DashboardResource {

    @Inject
    ApplicationDao applicationDao;

    @Inject
    ParkingPermitDao parkingPermitDao;

    @Inject
    DogRegistrationDao dogRegistrationDao;

    @GET
    @Path("/summary")
    @Operation(
        summary = "Get dashboard summary for the authenticated citizen",
        description = "Returns application counts by status/type and the 10 most recent applications. " +
                      "Pass citizenId via X-Citizen-Id header."
    )
    public Response getSummary(
            @Parameter(description = "Citizen ID from login response", required = true)
            @HeaderParam("X-Citizen-Id") Long citizenId) {

        if (citizenId == null) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("UNAUTHORIZED", "X-Citizen-Id header fehlt."))
                    .build();
        }

        DashboardSummaryResponse summary = new DashboardSummaryResponse();
        summary.parkingPermitCount     = parkingPermitDao.countByCitizenId(citizenId);
        summary.dogRegistrationCount   = dogRegistrationDao.countByCitizenId(citizenId);
        summary.openApplicationCount   = applicationDao.countByCitizenAndStatus(citizenId, ApplicationStatus.PENDING);
        summary.totalApplicationCount  = applicationDao.findByCitizenId(citizenId).size();
        summary.approvedCount          = applicationDao.countByCitizenAndStatus(citizenId, ApplicationStatus.APPROVED);
        summary.rejectedCount          = applicationDao.countByCitizenAndStatus(citizenId, ApplicationStatus.REJECTED);
        summary.parkingApplicationCount = applicationDao.countByCitizenAndType(citizenId, ApplicationType.PARKING);
        summary.addressApplicationCount = applicationDao.countByCitizenAndType(citizenId, ApplicationType.ADDRESS);

        List<Application> recent = applicationDao.findRecentApplicationsByCitizen(citizenId, 10);
        summary.recentActivity = recent.stream()
                .map(a -> new RecentActivityItem(
                        a.getId(),
                        a.getType() != null ? a.getType().name() : null,
                        a.getTypeDisplay(),
                        a.getStatus() != null ? a.getStatus().name() : null,
                        a.getStatusDisplay(),
                        a.getCreatedDate(),
                        a.getLastUpdated(),
                        a.getNotes()))
                .collect(Collectors.toList());

        return Response.ok(summary).build();
    }
}
