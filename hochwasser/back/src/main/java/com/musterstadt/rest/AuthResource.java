package com.musterstadt.rest;

import com.musterstadt.dao.CitizenDao;
import com.musterstadt.dto.CitizenDto;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentication resource.
 *
 * Preserves the original application's single hardcoded credential:
 *   username: buerger  /  password: demo-password  (citizen ID 1 = Hans Müller)
 *
 * Uses a simple in-memory session token map — stateless enough for a REST API
 * demo while remaining functionally equivalent to the JSF LoginBean session.
 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Login and logout")
public class AuthResource {

    // Single hardcoded demo account (mirrors LoginBean)
    private static final String DEMO_USER = "buerger";
    private static final String DEMO_PASS = "demo-password";
    private static final Long   DEMO_CITIZEN_ID = 1L;

    // In-memory token store: token → citizenId
    // ponytail: single-node, not clustered. Upgrade path: Redis or JWT.
    static final Map<String, Long> SESSIONS = new ConcurrentHashMap<>();

    @Inject
    CitizenDao citizenDao;

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class LoginResponse {
        public String token;
        public Long citizenId;
        public String citizenName;
        public String message;
    }

    @POST
    @Path("/login")
    @Operation(summary = "Login", description = "Authenticate with username and password. Returns a session token.")
    public Response login(LoginRequest req) {
        if (req == null || !DEMO_USER.equals(req.username) || !DEMO_PASS.equals(req.password)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "Ungültige Anmeldedaten."))
                    .build();
        }

        String token = java.util.UUID.randomUUID().toString();
        SESSIONS.put(token, DEMO_CITIZEN_ID);

        CitizenDto citizen = null;
        try {
            var c = citizenDao.findById(DEMO_CITIZEN_ID);
            if (c != null) citizen = CitizenDto.from(c);
        } catch (Exception ignored) { /* DB might not be seeded yet on very first call */ }

        LoginResponse resp = new LoginResponse();
        resp.token = token;
        resp.citizenId = DEMO_CITIZEN_ID;
        resp.citizenName = citizen != null ? citizen.fullName : "Hans Müller";
        resp.message = "Anmeldung erfolgreich.";
        return Response.ok(resp).build();
    }

    @POST
    @Path("/logout")
    @Operation(summary = "Logout", description = "Invalidate the current session token.")
    public Response logout(@HeaderParam("X-Auth-Token") String token) {
        if (token != null) {
            SESSIONS.remove(token);
        }
        return Response.ok(Map.of("message", "Abmeldung erfolgreich.")).build();
    }
}
