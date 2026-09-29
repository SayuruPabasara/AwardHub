package com.awardhub.vote.service;

import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.user.entity.AccountStatus;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import com.awardhub.vote.dto.AuthDTOs.AuthResponse;
import com.awardhub.vote.dto.AuthDTOs.LoginRequest;
import com.awardhub.vote.dto.AuthDTOs.PasswordChangeRequest;
import com.awardhub.vote.dto.AuthDTOs.ProfileUpdateRequest;
import com.awardhub.vote.dto.AuthDTOs.RegisterRequest;
import com.awardhub.vote.dto.AuthDTOs.UserDto;
import com.awardhub.vote.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * INTEGRATION FIX applied here:
 *  - package corrected to com.awardhub.vote.service.
 *  - rewritten against the one shared user.entity.User (was the deleted
 *    duplicate com.awardhub.entity.User).
 *  - the Ban entity/BanRepository this class depended on for
 *    login-time ban checks and deactivateOwnAccount() do not exist anywhere
 *    in the codebase (they were referenced but never built). Ban checking is
 *    dropped for now: deactivateOwnAccount() simply sets accountStatus to
 *    DEACTIVATED, and login only checks accountStatus. Re-introducing bans
 *    is a separate, explicit feature to design with the team (see write-up)
 *    rather than something to half-wire back in here.
 *  - audit logging now goes through the common.audit.AuditLogService that
 *    already exists and is already used by the profile module, instead of
 *    the vote module's own AuditService (which depends on an AuditEntry
 *    entity that was never created).
 *  - exceptions come from common.exception.BadRequestException instead of a
 *    nested class on a "com.awardhub.config.GlobalExceptionHandler" that
 *    never existed.
 *  - "status" is now the real AccountStatus enum instead of a raw string
 *    ("active"/"locked"/"inactive"), so login checks are type-safe.
 */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuditLogService audit;

    public AuthService(UserRepository users, PasswordEncoder encoder,
                        JwtService jwtService, AuditLogService audit) {
        this.users = users;
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
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new BadRequestException("An account with this email already exists.");
        }
        if (users.existsByNicIgnoreCase(nic)) {
            throw new BadRequestException("This NIC number is already registered to another account. One account per person.");
        }

        User user = new User();
        user.setUsername(req.email().trim());
        user.setFullName(req.name().trim());
        user.setEmail(req.email().trim());
        user.setPassword(encoder.encode(req.password()));
        user.setNic(nic);
        user.setRole(Role.VOTER);
        user.setAvatar(initials(req.name()));
        // Registration still requires the email-OTP verification step the team
        // decided on (see voting-system notes) before the account becomes ACTIVE;
        // that verification endpoint is a separate piece of work, not part of
        // this fix. Left at the entity's default (PENDING_VERIFICATION).
        User saved = users.save(user);

        audit.log(saved.getId(), "ACCOUNT_REGISTERED", "User", saved.getId(),
                "New voter account registered from IP " + ip);

        return new AuthResponse(jwtService.generateToken(saved), UserDto.from(saved));
    }

    @Transactional
    public AuthResponse login(LoginRequest req, String ip) {
        User user = users.findByEmailIgnoreCase(req.email() == null ? "" : req.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!user.isLoginAllowed()) {
            throw new BadRequestException("This account is " + user.getAccountStatus() + ". Contact support.");
        }
        if (!encoder.matches(req.password() == null ? "" : req.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        user.setLastLogin(LocalDateTime.now());
        User saved = users.save(user);

        audit.log(saved.getId(), "LOGIN", "User", saved.getId(), "Login from IP " + ip);
        return new AuthResponse(jwtService.generateToken(saved), UserDto.from(saved));
    }

    @Transactional
    public UserDto updateProfile(User actor, ProfileUpdateRequest req) {
        if (req.name() != null && !req.name().isBlank()) actor.setFullName(req.name().trim());
        if (req.bio() != null) actor.setBio(req.bio());
        if (req.location() != null) actor.setLocation(req.location());
        if (req.website() != null) actor.setWebsite(req.website());
        if (req.notifEmail() != null) actor.setNotifEmail(req.notifEmail());
        if (req.notifSms() != null) actor.setNotifSms(req.notifSms());
        if (req.notifResults() != null) actor.setNotifResults(req.notifResults());
        User saved = users.save(actor);
        return UserDto.from(saved);
    }

    @Transactional
    public void changePassword(User actor, PasswordChangeRequest req, String ip) {
        if (!encoder.matches(req.currentPassword() == null ? "" : req.currentPassword(), actor.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }
        if (req.newPassword() == null || req.newPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters.");
        }
        actor.setPassword(encoder.encode(req.newPassword()));
        users.save(actor);
        audit.log(actor.getId(), "PASSWORD_CHANGED", "User", actor.getId(), "Password changed from IP " + ip);
    }

    /**
     * Self-service account deletion: deactivated rather than hard-deleted, so
     * existing nominations/votes/evaluations tied to this user keep their
     * foreign keys intact and the audit trail stays meaningful.
     */
    @Transactional
    public void deactivateOwnAccount(User actor, String ip) {
        actor.setAccountStatus(AccountStatus.DEACTIVATED);
        users.save(actor);
        audit.log(actor.getId(), "ACCOUNT_DEACTIVATED", "User", actor.getId(),
                "User requested account deletion from IP " + ip);
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
