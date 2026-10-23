package com.musterstadt.rest;

import com.musterstadt.rest.dto.ErrorResponse;
import com.musterstadt.rest.dto.LoginRequest;
import com.musterstadt.rest.dto.LoginResponse;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Authentication REST resource.
 *
 * Mirrors the logic from LoginBean (single hardcoded demo credential).
 * Security note: this is intentionally insecure for demo purposes.
 * Do not deploy to production without proper identity management.
 *
 * POST /api/auth/login  – authenticate and return citizen context
 * POST /api/auth/logout – stateless no-op (session is managed client-side)
 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Login and logout endpoints")
public class AuthResource {

    private static final String VALID_USERNAME = "buerger";
    // ponytail: demo-only credential — replace with proper auth before production
    private static final String VALID_PASSWORD = "demo-password";
    // ponytail: single demo citizen — replace with citizen lookup when multi-user auth is added
    private static final long DEMO_CITIZEN_ID = 1L;

    @POST
    @Path("/login")
    @Operation(
        summary = "Authenticate a citizen",
        description = "Validates username and password. Returns citizenId on success. " +
                      "Demo credentials: username=buerger, password=demo-password"
    )
    public Response login(LoginRequest request) {
        if (request == null || request.username == null || request.password == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("BAD_REQUEST", "Benutzername und Passwort sind erforderlich."))
                    .build();
        }

        if (VALID_USERNAME.equals(request.username) && VALID_PASSWORD.equals(request.password)) {
            return Response.ok(
                    new LoginResponse(true, "Anmeldung erfolgreich.", DEMO_CITIZEN_ID, request.username))
                    .build();
        }

        return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new LoginResponse(false, "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.", null, null))
                .build();
    }

    @POST
    @Path("/logout")
    @Operation(
        summary = "Logout (stateless no-op)",
        description = "This REST API is stateless. The client should discard the citizenId token."
    )
    public Response logout() {
        return Response.ok(new LoginResponse(true, "Erfolgreich abgemeldet.", null, null)).build();
    }
}
