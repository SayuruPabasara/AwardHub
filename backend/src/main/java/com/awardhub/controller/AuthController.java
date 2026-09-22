package com.awardhub.controller;

import com.awardhub.dto.DTOs.AuthResponse;
import com.awardhub.dto.DTOs.LoginRequest;
import com.awardhub.dto.DTOs.MessageResponse;
import com.awardhub.dto.DTOs.PasswordChangeRequest;
import com.awardhub.dto.DTOs.ProfileUpdateRequest;
import com.awardhub.dto.DTOs.RegisterRequest;
import com.awardhub.dto.DTOs.UserDto;
import com.awardhub.entity.User;
import com.awardhub.security.CurrentUser;
import com.awardhub.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    private static String ip(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest body, HttpServletRequest http) {
        return ResponseEntity.ok(auth.register(body, ip(http)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest body, HttpServletRequest http) {
        return ResponseEntity.ok(auth.login(body, ip(http)));
    }

    @GetMapping("/me")
    public UserDto me() {
        return UserDto.from(currentUser());
    }

    @PutMapping("/profile")
    public UserDto updateProfile(@RequestBody ProfileUpdateRequest body) {
        return auth.updateProfile(currentUser(), body);
    }

    @PutMapping("/password")
    public MessageResponse changePassword(@RequestBody PasswordChangeRequest body, HttpServletRequest http) {
        auth.changePassword(currentUser(), body, ip(http));
        return new MessageResponse("Password updated.");
    }

    @DeleteMapping("/me")
    public MessageResponse deleteMe(HttpServletRequest http) {
        auth.deactivateOwnAccount(currentUser(), ip(http));
        return new MessageResponse("Account deactivated. All data preserved for audit purposes.");
    }

    private User currentUser() {
        User u = CurrentUser.get();
        if (u == null) throw new com.awardhub.config.GlobalExceptionHandler.ForbiddenException("Not authenticated.");
        return u;
    }
}
