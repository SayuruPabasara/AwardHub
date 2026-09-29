package com.awardhub.vote.controller;

import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.user.entity.User;
import com.awardhub.vote.dto.AuthDTOs.AdminUserDto;
import com.awardhub.vote.dto.AuthDTOs.MessageResponse;
import com.awardhub.vote.dto.AuthDTOs.UserCreateRequest;
import com.awardhub.vote.security.CurrentUser;
import com.awardhub.vote.service.AccountAdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * INTEGRATION FIX applied here:
 *  - package corrected to com.awardhub.vote.controller.
 *  - rewritten against com.awardhub.user.entity.User and the trimmed
 *    AccountAdminService (see its Javadoc for what was intentionally left
 *    out and why: ban management, suspicious-activity flagging and a second
 *    judge-assignment flow, none of which had a real entity behind them).
 *  - added @PreAuthorize so only IT_COORDINATOR accounts can reach these
 *    endpoints — the original had no method-level or path-level protection
 *    at all despite creating accounts and issuing password resets.
 */
@RestController
@RequestMapping("/api/itcoordinator")
@PreAuthorize("hasRole('IT_COORDINATOR')")
public class ItCoordinatorController {

    private final AccountAdminService admin;

    public ItCoordinatorController(AccountAdminService admin) {
        this.admin = admin;
    }

    private static String ip(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }

    private User currentUser() {
        User u = CurrentUser.get();
        if (u == null) throw new UnauthorizedActionException("Not authenticated.");
        return u;
    }

    @GetMapping("/accounts")
    public List<AdminUserDto> accounts() {
        return admin.listUsers();
    }

    @PostMapping("/accounts")
    public AdminUserDto create(@RequestBody UserCreateRequest body, HttpServletRequest http) {
        return admin.createUser(body, currentUser(), ip(http));
    }

    @PostMapping("/accounts/{id}/reset-password")
    public MessageResponse resetPassword(@PathVariable Long id, HttpServletRequest http) {
        String temp = admin.resetPassword(id, currentUser(), ip(http));
        return new MessageResponse("Temporary password issued: " + temp);
    }

    @PostMapping("/accounts/{id}/deactivate")
    public MessageResponse deactivate(@PathVariable Long id, HttpServletRequest http) {
        admin.deactivate(id, currentUser(), ip(http));
        return new MessageResponse("Account deactivated.");
    }
}
