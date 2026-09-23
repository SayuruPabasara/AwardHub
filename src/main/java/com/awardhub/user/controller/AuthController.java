package com.awardhub.user.controller;

import com.awardhub.common.response.ApiResponse;
import com.awardhub.user.dto.LoginRequest;
import com.awardhub.user.dto.LoginResponse;
import com.awardhub.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticate Award Organizer
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful. Welcome to AwardHub Organizer Console.", response));
    }

    /**
     * Get details of currently logged-in organizer
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
        }
        LoginResponse response = authService.getCurrentOrganizer(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Organizer details retrieved successfully", response));
    }
}
