package com.awardhub.nomination.controller;

import com.awardhub.nomination.dto.NominationCreateRequest;
import com.awardhub.nomination.dto.NominationDecisionRequest;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.dto.NominationUpdateRequest;
import com.awardhub.nomination.service.NominationService;
import com.awardhub.user.entity.User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

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

    // ---- Organizer and Admin review ----

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public NominationResponseDTO moveToReview(@PathVariable Long id, @AuthenticationPrincipal User me) {
        return nominations.moveToReview(id, me);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public NominationResponseDTO approve(@PathVariable Long id, @AuthenticationPrincipal User me) {
        return nominations.approve(id, me);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public NominationResponseDTO reject(@PathVariable Long id, @RequestBody NominationDecisionRequest body,
                                         @AuthenticationPrincipal User me) {
        return nominations.reject(id, body, me);
    }

    @GetMapping("/category/{categoryId}/all")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
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

    @PostMapping(value = "/upload-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('NOMINEE')")
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file) {
        String documentUrl = nominations.storeSupportingDocument(file);
        return ResponseEntity.ok(Map.of("url", documentUrl, "fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "document"));
    }

    @GetMapping("/documents/{fileName}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String fileName) {
        Path path = nominations.resolveSupportingDocument(fileName);
        try {
            Resource res = new UrlResource(path.toUri());
            if (!res.exists() || !res.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(res);
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
