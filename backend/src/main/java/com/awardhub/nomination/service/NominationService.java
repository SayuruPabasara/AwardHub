package com.awardhub.nomination.service;

import com.awardhub.category.entity.Category;
import com.awardhub.category.repository.CategoryRepository;
import com.awardhub.common.audit.AuditLogService;
import com.awardhub.common.enums.CategoryStatus;
import com.awardhub.common.enums.NominationStatus;
import com.awardhub.common.exception.BadRequestException;
import com.awardhub.common.exception.InvalidStatusTransitionException;
import com.awardhub.common.exception.ResourceNotFoundException;
import com.awardhub.common.exception.UnauthorizedActionException;
import com.awardhub.nomination.dto.NominationCreateRequest;
import com.awardhub.nomination.dto.NominationDecisionRequest;
import com.awardhub.nomination.dto.NominationResponseDTO;
import com.awardhub.nomination.dto.NominationUpdateRequest;
import com.awardhub.nomination.entity.Nomination;
import com.awardhub.nomination.repository.NominationRepository;
import com.awardhub.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * INTEGRATION FIX (nomination workflow rebuild).
 *
 * Replaces the previous bare-CRUD service, which had no workflow at all:
 * a client could create a nomination already marked APPROVED for any
 * nomineeId it liked, with no auth check on the endpoint. This version:
 *   - derives nomineeId from the authenticated principal, never the request body
 *   - enforces DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED/REJECTED
 *   - only lets the owning nominee create/edit/submit/delete their own DRAFT,
 *     and only lets an organizer move a nomination through review
 *   - checks the category is ACTIVE and within its nomination window before
 *     accepting a new nomination or a submission
 *   - writes an audit log entry for every state change, via the same
 *     common.audit.AuditLogService the vote module now uses
 */
@Service
public class NominationService {

    private final NominationRepository nominations;
    private final CategoryRepository categories;
    private final AuditLogService audit;

    public NominationService(NominationRepository nominations, CategoryRepository categories, AuditLogService audit) {
        this.nominations = nominations;
        this.categories = categories;
        this.audit = audit;
    }

    @Transactional
    public NominationResponseDTO create(NominationCreateRequest req, User nominee) {
        if (req.getCategoryId() == null) throw new BadRequestException("Category is required.");
        if (req.getTitle() == null || req.getTitle().isBlank()) throw new BadRequestException("Title is required.");
        if (req.getDescription() == null || req.getDescription().isBlank()) throw new BadRequestException("Description is required.");

        Category category = requireOpenForNomination(req.getCategoryId());

        Nomination n = new Nomination();
        n.setCategoryId(category.getId());
        n.setNomineeId(nominee.getId());
        n.setTitle(req.getTitle().trim());
        n.setDescription(req.getDescription().trim());
        n.setSupportingDocument(req.getSupportingDocument());
        n.setStatus(NominationStatus.DRAFT);
        Nomination saved = nominations.save(n);

        audit.log(nominee.getId(), "NOMINATION_CREATED", "Nomination", saved.getId(),
                "Draft nomination created for category " + category.getId());
        return NominationResponseDTO.from(saved);
    }

    @Transactional
    public NominationResponseDTO update(Long id, NominationUpdateRequest req, User nominee) {
        Nomination n = requireOwned(id, nominee);
        if (n.getStatus() != NominationStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only a draft nomination can be edited. Withdraw is not available once submitted.");
        }
        if (req.getTitle() != null && !req.getTitle().isBlank()) n.setTitle(req.getTitle().trim());
        if (req.getDescription() != null && !req.getDescription().isBlank()) n.setDescription(req.getDescription().trim());
        if (req.getSupportingDocument() != null) n.setSupportingDocument(req.getSupportingDocument());
        return NominationResponseDTO.from(nominations.save(n));
    }

    @Transactional
    public NominationResponseDTO submit(Long id, User nominee) {
        Nomination n = requireOwned(id, nominee);
        if (n.getStatus() != NominationStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only a draft nomination can be submitted.");
        }
        requireOpenForNomination(n.getCategoryId());

        n.setStatus(NominationStatus.SUBMITTED);
        Nomination saved = nominations.save(n);
        audit.log(nominee.getId(), "NOMINATION_SUBMITTED", "Nomination", id, "Submitted for review");
        return NominationResponseDTO.from(saved);
    }

    @Transactional
    public void delete(Long id, User nominee) {
        Nomination n = requireOwned(id, nominee);
        if (n.getStatus() != NominationStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only a draft nomination can be deleted. A submitted nomination cannot be withdrawn.");
        }
        nominations.delete(n);
        audit.log(nominee.getId(), "NOMINATION_DELETED", "Nomination", id, "Draft nomination deleted by owner");
    }

    // ---- Organizer review workflow ----

    @Transactional
    public NominationResponseDTO moveToReview(Long id, User organizer) {
        Nomination n = findOrThrow(id);
        if (n.getStatus() != NominationStatus.SUBMITTED) {
            throw new InvalidStatusTransitionException("Only a submitted nomination can move to review.");
        }
        n.setStatus(NominationStatus.UNDER_REVIEW);
        n.setReviewedBy(organizer.getId());
        Nomination saved = nominations.save(n);
        audit.log(organizer.getId(), "NOMINATION_UNDER_REVIEW", "Nomination", id, "Moved to review");
        return NominationResponseDTO.from(saved);
    }

    @Transactional
    public NominationResponseDTO approve(Long id, User organizer) {
        Nomination n = findOrThrow(id);
        if (n.getStatus() != NominationStatus.SUBMITTED && n.getStatus() != NominationStatus.UNDER_REVIEW) {
            throw new InvalidStatusTransitionException("Only a submitted or under-review nomination can be approved.");
        }
        n.setStatus(NominationStatus.APPROVED);
        n.setRejectionReason(null);
        n.setReviewedBy(organizer.getId());
        n.setReviewedAt(LocalDateTime.now());
        Nomination saved = nominations.save(n);
        audit.log(organizer.getId(), "NOMINATION_APPROVED", "Nomination", id, "Approved by organizer");
        return NominationResponseDTO.from(saved);
    }

    @Transactional
    public NominationResponseDTO reject(Long id, NominationDecisionRequest req, User organizer) {
        if (req == null || req.getRejectionReason() == null || req.getRejectionReason().isBlank()) {
            throw new BadRequestException("A rejection reason is required.");
        }
        Nomination n = findOrThrow(id);
        if (n.getStatus() != NominationStatus.SUBMITTED && n.getStatus() != NominationStatus.UNDER_REVIEW) {
            throw new InvalidStatusTransitionException("Only a submitted or under-review nomination can be rejected.");
        }
        n.setStatus(NominationStatus.REJECTED);
        n.setRejectionReason(req.getRejectionReason().trim());
        n.setReviewedBy(organizer.getId());
        n.setReviewedAt(LocalDateTime.now());
        Nomination saved = nominations.save(n);
        audit.log(organizer.getId(), "NOMINATION_REJECTED", "Nomination", id, "Rejected: " + n.getRejectionReason());
        return NominationResponseDTO.from(saved);
    }

    // ---- Reads ----

    @Transactional(readOnly = true)
    public NominationResponseDTO getVisibleTo(Long id, User actor) {
        Nomination n = findOrThrow(id);
        boolean isOwner = actor != null && actor.getId().equals(n.getNomineeId());
        boolean isOrganizer = actor != null && actor.getRole() != null && actor.getRole().name().equals("ORGANIZER");
        if (!isOwner && !isOrganizer && n.getStatus() != NominationStatus.APPROVED) {
            throw new UnauthorizedActionException("This nomination is not visible until it is approved.");
        }
        return NominationResponseDTO.from(n);
    }

    @Transactional(readOnly = true)
    public List<NominationResponseDTO> mine(User nominee) {
        return nominations.findByNomineeId(nominee.getId()).stream().map(NominationResponseDTO::from).toList();
    }

    /** Organizer view: every nomination in a category, any status. */
    @Transactional(readOnly = true)
    public List<NominationResponseDTO> forCategory(Long categoryId) {
        return nominations.findByCategoryId(categoryId).stream().map(NominationResponseDTO::from).toList();
    }

    /** Public/voter view: only nominations that cleared review. */
    @Transactional(readOnly = true)
    public List<NominationResponseDTO> approvedForCategory(Long categoryId) {
        return nominations.findByCategoryIdAndStatus(categoryId, NominationStatus.APPROVED)
                .stream().map(NominationResponseDTO::from).toList();
    }

    // ---- Helpers ----

    private Nomination findOrThrow(Long id) {
        return nominations.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nomination not found: " + id));
    }

    private Nomination requireOwned(Long id, User nominee) {
        Nomination n = findOrThrow(id);
        if (nominee == null || !n.getNomineeId().equals(nominee.getId())) {
            throw new UnauthorizedActionException("You do not own this nomination.");
        }
        return n;
    }

    private Category requireOpenForNomination(Long categoryId) {
        Category category = categories.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
        if (category.getStatus() != CategoryStatus.ACTIVE) {
            throw new BadRequestException("This category is not currently accepting nominations.");
        }
        LocalDateTime now = LocalDateTime.now();
        if (category.getNominationStartDate() != null && now.isBefore(category.getNominationStartDate())) {
            throw new BadRequestException("The nomination window has not opened yet for this category.");
        }
        if (category.getNominationEndDate() != null && now.isAfter(category.getNominationEndDate())) {
            throw new BadRequestException("The nomination window has closed for this category.");
        }
        return category;
    }

    private static final String UPLOAD_DIR = "uploads/nominations";
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10MB

    public String storeSupportingDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds 10MB limit.");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("Uploaded file has no name.");
        }
        String cleaned = Paths.get(originalName).getFileName().toString();
        int dot = cleaned.lastIndexOf('.');
        String ext = (dot == -1 || dot == cleaned.length() - 1) ? "" : cleaned.substring(dot + 1).toLowerCase();

        try {
            Path dir = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String storedFileName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
            Path target = dir.resolve(storedFileName).normalize();
            if (!target.getParent().equals(dir)) {
                throw new BadRequestException("Invalid file path.");
            }
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/api/nominations/documents/" + storedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded document: " + e.getMessage(), e);
        }
    }

    public Path resolveSupportingDocument(String storedFileName) {
        if (storedFileName == null || storedFileName.contains("..") || storedFileName.contains("/") || storedFileName.contains("\\")) {
            throw new BadRequestException("Invalid document filename.");
        }
        Path dir = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        Path target = dir.resolve(storedFileName).normalize();
        if (!target.getParent().equals(dir) || !Files.exists(target)) {
            throw new ResourceNotFoundException("Supporting document not found: " + storedFileName);
        }
        return target;
    }
}
