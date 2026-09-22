package com.awardhub.controller;

import com.awardhub.dto.DTOs.AdminUserDto;
import com.awardhub.dto.DTOs.MessageResponse;
import com.awardhub.dto.DTOs.UserCreateRequest;
import com.awardhub.entity.User;
import com.awardhub.repository.UserRepository;
import com.awardhub.security.CurrentUser;
import com.awardhub.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itcoordinator")
public class ItCoordinatorController {

    private final AdminService admin;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public ItCoordinatorController(AdminService admin, UserRepository users, PasswordEncoder encoder) {
        this.admin = admin;
        this.users = users;
        this.encoder = encoder;
    }

    private static String ip(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }

    @GetMapping("/accounts")
    public List<AdminUserDto> accounts() {
        return admin.listUsers();
    }

    @PostMapping("/accounts")
    public AdminUserDto create(@RequestBody UserCreateRequest body, HttpServletRequest http) {
        return admin.createUser(body, CurrentUser.get(), ip(http));
    }

    /** Simulated password reset — issues a temporary password. */
    @PostMapping("/accounts/{id}/reset-password")
    public MessageResponse resetPassword(@PathVariable Long id, HttpServletRequest http) {
        User u = users.findById(id).orElseThrow(() ->
                new com.awardhub.config.GlobalExceptionHandler.NotFoundException("User not found: " + id));
        String temp = "Reset-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        u.setPasswordHash(encoder.encode(temp));
        users.save(u);
        return new MessageResponse("Temporary password for " + u.getEmail() + ": " + temp);
    }

    @PostMapping("/accounts/{id}/deactivate")
    public MessageResponse deactivate(@PathVariable Long id, HttpServletRequest http) {
        admin.setUserStatus(id, "inactive", CurrentUser.get(), ip(http));
        return new MessageResponse("Account deactivated.");
    }
}
