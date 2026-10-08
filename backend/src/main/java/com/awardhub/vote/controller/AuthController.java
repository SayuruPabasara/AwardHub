package com.awardhub.vote.controller;

import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.user.entity.User;
import com.awardhub.vote.dto.AuthDTOs.AuthResponse;
import com.awardhub.vote.dto.AuthDTOs.LoginRequest;
import com.awardhub.vote.dto.AuthDTOs.MessageResponse;
import com.awardhub.vote.dto.AuthDTOs.PasswordChangeRequest;
import com.awardhub.vote.dto.AuthDTOs.ProfileUpdateRequest;
import com.awardhub.vote.dto.AuthDTOs.RegisterRequest;
import com.awardhub.vote.dto.AuthDTOs.UserDto;
import com.awardhub.vote.security.CurrentUser;
import com.awardhub.vote.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * INTEGRATION FIX applied here:
 *  - package corrected to com.awardhub.vote.controller.
 *  - rewritten against com.awardhub.user.entity.User and the trimmed
 *    AuthDTOs, dropping the reference to a
 *    "com.awardhub.config.GlobalExceptionHandler.ForbiddenException" nested
 *    class that never existed — uses the real
 *    common.exception.UnauthorizedActionException instead, which
 *    GlobalExceptionHandler already maps to 403.
 */
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
        if (u == null) throw new UnauthorizedActionException("Not authenticated.");
        return u;
    }
}
