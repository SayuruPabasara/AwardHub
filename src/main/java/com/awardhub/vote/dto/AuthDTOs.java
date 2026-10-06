package com.awardhub.vote.dto;

import com.awardhub.common.enums.Role;
import com.awardhub.user.entity.AccountStatus;
import com.awardhub.user.entity.User;

import java.time.LocalDateTime;

/**
 * Request/response records for authentication and account administration.
 *
 * INTEGRATION FIX: this replaces only the auth-related subset of the vote
 * module's old DTOs.java (AuthResponse, UserDto, RegisterRequest,
 * LoginRequest, ProfileUpdateRequest, PasswordChangeRequest, MessageResponse,
 * UserCreateRequest, AdminUserDto). The rest of that file — VotingDto,
 * NominationDto, VoteDto, RubricCriterionDto, BanDto, JudgeAssignmentDto,
 * SuspiciousDto, AuditDto — depended on entities that were never actually
 * included in the module (Voting-as-contest with blind codes, a second
 * Nomination, a second RubricCriterion, Ban, SuspiciousActivity, a second
 * JudgeAssignment, AuditEntry) and is intentionally left untouched pending
 * an architecture decision — see the write-up.
 */
public final class AuthDTOs {
    private AuthDTOs() {}

    public record AuthResponse(String token, UserDto user) {}

    public record UserDto(Long id, String fullName, String email, String nic, String role,
                          String accountStatus, String bio, String location, String website, String avatar,
                          boolean notifEmail, boolean notifSms, boolean notifResults,
                          LocalDateTime registrationDate, LocalDateTime lastLogin) {
        public static UserDto from(User u) {
            return new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getNic(),
                    u.getRole() != null ? u.getRole().name() : null,
                    u.getAccountStatus() != null ? u.getAccountStatus().name() : null,
                    u.getBio(), u.getLocation(), u.getWebsite(), u.getAvatar(),
                    u.isNotifEmail(), u.isNotifSms(), u.isNotifResults(),
                    u.getRegistrationDate(), u.getLastLogin());
        }
    }

    public record RegisterRequest(String name, String fullName, String username, String email, String password, String nic, String role) {
        public RegisterRequest(String name, String email, String password, String nic) {
            this(name, null, null, email, password, nic, null);
        }

        public String resolveName() {
            if (name != null && !name.isBlank()) return name.trim();
            if (fullName != null && !fullName.isBlank()) return fullName.trim();
            if (username != null && !username.isBlank()) return username.trim();
            return null;
        }

        public String resolveUsername() {
            if (username != null && !username.isBlank()) return username.trim();
            if (email != null && !email.isBlank()) return email.trim();
            return resolveName();
        }
    }

    public record LoginRequest(String email, String username, String password) {
        public LoginRequest(String email, String password) {
            this(email, null, password);
        }

        public String resolveIdentifier() {
            if (email != null && !email.isBlank()) return email.trim();
            if (username != null && !username.isBlank()) return username.trim();
            return "";
        }
    }
    public record ProfileUpdateRequest(String name, String bio, String location, String website,
                                       Boolean notifEmail, Boolean notifSms, Boolean notifResults) {}
    public record PasswordChangeRequest(String currentPassword, String newPassword) {}
    public record MessageResponse(String message) {}

    // ── IT Coordinator / admin account management ──

    public record AdminUserDto(Long id, String fullName, String email, String nic, String role,
                               String accountStatus, LocalDateTime registrationDate, LocalDateTime lastLogin) {
        public static AdminUserDto from(User u) {
            return new AdminUserDto(u.getId(), u.getFullName(), u.getEmail(), u.getNic(),
                    u.getRole() != null ? u.getRole().name() : null,
                    u.getAccountStatus() != null ? u.getAccountStatus().name() : null,
                    u.getRegistrationDate(), u.getLastLogin());
        }
    }

    public record UserCreateRequest(String name, String email, String password, String nic, String role) {}
}
