package com.awardhub.service;

import com.awardhub.config.GlobalExceptionHandler.BadRequestException;
import com.awardhub.config.GlobalExceptionHandler.NotFoundException;
import com.awardhub.dto.DTOs.AuthResponse;
import com.awardhub.dto.DTOs.LoginRequest;
import com.awardhub.dto.DTOs.PasswordChangeRequest;
import com.awardhub.dto.DTOs.ProfileUpdateRequest;
import com.awardhub.dto.DTOs.RegisterRequest;
import com.awardhub.dto.DTOs.UserDto;
import com.awardhub.entity.Ban;
import com.awardhub.entity.User;
import com.awardhub.repository.BanRepository;
import com.awardhub.repository.UserRepository;
import com.awardhub.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository users;
    private final BanRepository bans;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuditService audit;

    public AuthService(UserRepository users, BanRepository bans, PasswordEncoder encoder,
                       JwtService jwtService, AuditService audit) {
        this.users = users;
        this.bans = bans;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.audit = audit;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req, String ip) {
        if (req.name() == null || req.name().isBlank()) throw new BadRequestException("Name is required.");
        if (req.email() == null || !req.email().contains("@")) throw new BadRequestException("Valid email is required.");
        if (req.password() == null || req.password().length() < 6) throw new BadRequestException("Password must be at least 6 characters.");
        if (req.nic() == null) throw new BadRequestException("NIC number is required.");
        String nic = req.nic().trim().toUpperCase();
        if (!nic.matches("\\d{9}[VX]") && !nic.matches("\\d{12}")) {
            throw new BadRequestException("Please enter a valid NIC number (old format 123456789V or new format 12 digits).");
        }
        if (users.existsByEmailIgnoreCase(req.email())) throw new BadRequestException("An account with this email already exists.");
        if (users.existsByNicIgnoreCase(nic)) {
            audit.log(null, "REGISTER_ATTEMPT", "nic-" + nic,
                    "Duplicate NIC registration attempt for email " + req.email(), ip, true);
            throw new BadRequestException("This NIC number is already registered to another account. One account per person.");
        }

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(req.email().trim());
        user.setPasswordHash(encoder.encode(req.password()));
        user.setNic(nic);
        user.setRole(User.Role.VOTER);
        user.setAvatar(initials(req.name()));
        users.save(user);

        audit.log(user, "ACCOUNT_REGISTERED", "user-" + user.getId(), "New voter account registered", ip, false);
        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest req, String ip) {
        User user = users.findByEmailIgnoreCase(req.email() == null ? "" : req.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!"active".equals(user.getStatus())) {
            throw new BadRequestException("This account is " + user.getStatus() + ". Contact support.");
        }
        bans.findFirstByUserIdAndActiveTrueOrderByBannedAtDesc(user.getId()).ifPresent(ban -> {
            if (ban.getExpiresAt() == null || ban.getExpiresAt().isAfter(LocalDateTime.now())) {
                throw new BadRequestException("This account is banned: " + ban.getReason());
            }
        });
        if (!encoder.matches(req.password() == null ? "" : req.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        user.setLastLogin(LocalDateTime.now());
        users.save(user);
        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional
    public UserDto updateProfile(User actor, ProfileUpdateRequest req) {
        if (req.name() != null && !req.name().isBlank()) actor.setName(req.name().trim());
        if (req.bio() != null) actor.setBio(req.bio());
        if (req.location() != null) actor.setLocation(req.location());
        if (req.website() != null) actor.setWebsite(req.website());
        if (req.notifEmail() != null) actor.setNotifEmail(req.notifEmail());
        if (req.notifSms() != null) actor.setNotifSms(req.notifSms());
        if (req.notifResults() != null) actor.setNotifResults(req.notifResults());
        users.save(actor);
        return UserDto.from(actor);
    }

    @Transactional
    public void changePassword(User actor, PasswordChangeRequest req, String ip) {
        if (!encoder.matches(req.currentPassword() == null ? "" : req.currentPassword(), actor.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }
        if (req.newPassword() == null || req.newPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters.");
        }
        actor.setPasswordHash(encoder.encode(req.newPassword()));
        users.save(actor);
        audit.log(actor, "PASSWORD_CHANGED", "user-" + actor.getId(), "Password changed", ip, false);
    }

    /**
     * Self-service account deletion: the account is deactivated and locked rather
     * than hard-deleted, preserving referential integrity of votes/nominations while
     * preventing further logins. A permanent ban is recorded for the audit trail.
     */
    @Transactional
    public void deactivateOwnAccount(User actor, String ip) {
        actor.setStatus("locked");
        users.save(actor);
        Ban ban = new Ban();
        ban.setUser(actor);
        ban.setType(Ban.Type.permanent);
        ban.setReason("Account deletion requested by the user.");
        ban.setActive(true);
        bans.save(ban);
        audit.log(actor, "ACCOUNT_DELETION_REQUESTED", "user-" + actor.getId(),
                "User requested account deletion — account locked", ip, false);
    }

    private String initials(String name) {
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty() && sb.length() < 2) sb.append(Character.toUpperCase(p.charAt(0)));
        }
        return sb.toString();
    }
}
