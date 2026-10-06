package com.awardhub.nomination.controller;

import com.awardhub.nomination.dto.NominationCreateRequest;
import com.awardhub.nomination.dto.NominationDecisionRequest;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.dto.NominationUpdateRequest;
import com.awardhub.nomination.service.NominationService;
import com.awardhub.user.entity.User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * INTEGRATION FIX (nomination workflow rebuild): the original controller had
 * no @PreAuthorize anywhere and accepted nomineeId/status/rejectionReason
 * straight from the client — see NominationCreateRequest's Javadoc. Every
 * mutating endpoint here is now role-gated, and ownership/state checks live
 * in the service (requireOwned / requireOpenForNomination).
 */
@RestController
@RequestMapping("/api/nominations")
public class NominationController {

    private final NominationService nominations;

    public NominationController(NominationService nominations) {
        this.nominations = nominations;
    }

    // ---- Nominee actions ----

    @PostMapping
    @PreAuthorize("hasRole('NOMINEE')")
    public NominationResponseDTO create(@RequestBody NominationCreateRequest body, @AuthenticationPrincipal User me) {
        return nominations.create(body, me);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('NOMINEE')")
    public NominationResponseDTO update(@PathVariable Long id, @RequestBody NominationUpdateRequest body,
                                         @AuthenticationPrincipal User me) {
        return nominations.update(id, body, me);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('NOMINEE')")
    public NominationResponseDTO submit(@PathVariable Long id, @AuthenticationPrincipal User me) {
        return nominations.submit(id, me);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('NOMINEE')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User me) {
        nominations.delete(id, me);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('NOMINEE')")
    public List<NominationResponseDTO> mine(@AuthenticationPrincipal User me) {
        return nominations.mine(me);
    }

    // ---- Organizer review ----

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ORGANIZER')")
    public NominationResponseDTO moveToReview(@PathVariable Long id, @AuthenticationPrincipal User me) {
        return nominations.moveToReview(id, me);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ORGANIZER')")
    public NominationResponseDTO approve(@PathVariable Long id, @AuthenticationPrincipal User me) {
        return nominations.approve(id, me);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ORGANIZER')")
    public NominationResponseDTO reject(@PathVariable Long id, @RequestBody NominationDecisionRequest body,
                                         @AuthenticationPrincipal User me) {
        return nominations.reject(id, body, me);
    }

    @GetMapping("/category/{categoryId}/all")
    @PreAuthorize("hasRole('ORGANIZER')")
    public List<NominationResponseDTO> forCategory(@PathVariable Long categoryId) {
        return nominations.forCategory(categoryId);
    }

    // ---- Shared reads ----

    @GetMapping("/{id}")
    public NominationResponseDTO get(@PathVariable Long id, @AuthenticationPrincipal User me) {
        return nominations.getVisibleTo(id, me);
    }

    /** Approved nominations only — this is the list voters/judges/anyone should browse. */
    @GetMapping("/category/{categoryId}")
    public List<NominationResponseDTO> approvedForCategory(@PathVariable Long categoryId) {
        return nominations.approvedForCategory(categoryId);
    }
}
