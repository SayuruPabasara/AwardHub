package com.awardhub.vote.service;

import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.enums.Role;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.user.entity.AccountStatus;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import com.awardhub.vote.dto.AuthDTOs.AdminUserDto;
import com.awardhub.vote.dto.AuthDTOs.UserCreateRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * IT Coordinator account-management operations, split out of the vote
 * module's old AdminService.
 *
 * INTEGRATION FIX / SCOPE NOTE: the old AdminService mixed user-account
 * management with ban management, suspicious-activity flagging, judge
 * assignment and audit-log reads — all of which depend on entities
 * (Ban, SuspiciousActivity, a second JudgeAssignment, AuditEntry) that were
 * referenced but never actually created anywhere in the codebase. Rather
 * than guess at a design for those, this class covers only the account
 * operations that ItCoordinatorController actually exposed and that are
 * achievable against the real, unified User entity today:
 * list / create / reset password / deactivate. Ban management, suspicious-
 * activity flagging and judge assignment (there's already a working judge
 * assignment flow in the category module — CategoryController's
 * /api/categories/{id}/judges endpoints) are left for the team to
 * explicitly design rather than half-build here.
 */
@Service
public class AccountAdminService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuditLogService audit;

    public AccountAdminService(UserRepository users, PasswordEncoder encoder, AuditLogService audit) {
        this.users = users;
        this.encoder = encoder;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> listUsers() {
        return users.findAll().stream().map(AdminUserDto::from).toList();
    }

    @Transactional
    public AdminUserDto createUser(UserCreateRequest req, User actor, String ip) {
        if (req.email() == null || !req.email().contains("@")) throw new BadRequestException("Valid email is required.");
        if (req.password() == null || req.password().length() < 6) throw new BadRequestException("Password must be at least 6 characters.");
        if (users.existsByEmailIgnoreCase(req.email())) throw new BadRequestException("Email already in use.");

        Role role;
        try {
            role = Role.valueOf(req.role().toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + req.role());
        }

        User u = new User();
        u.setUsername(req.email().trim());
        u.setFullName(req.name());
        u.setEmail(req.email().trim());
        u.setPassword(encoder.encode(req.password()));
        u.setNic(req.nic());
        u.setRole(role);
        u.setAccountStatus(AccountStatus.ACTIVE);
        User saved = users.save(u);

        audit.log(actor.getId(), "ACCOUNT_CREATED", "User", saved.getId(), "Role: " + role);
        return AdminUserDto.from(saved);
    }

    /** Simulated password reset — issues a temporary password the coordinator relays to the user. */
    @Transactional
    public String resetPassword(Long id, User actor, String ip) {
        User u = findUser(id);
        String temp = "Reset-" + UUID.randomUUID().toString().substring(0, 8);
        u.setPassword(encoder.encode(temp));
        users.save(u);
        audit.log(actor.getId(), "PASSWORD_RESET", "User", id, "Temporary password issued by IT Coordinator");
        return temp;
    }

    @Transactional
    public void deactivate(Long id, User actor, String ip) {
        User u = findUser(id);
        u.setAccountStatus(AccountStatus.DEACTIVATED);
        users.save(u);
        audit.log(actor.getId(), "ACCOUNT_DEACTIVATED", "User", id, "Deactivated by IT Coordinator from IP " + ip);
    }

    private User findUser(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
