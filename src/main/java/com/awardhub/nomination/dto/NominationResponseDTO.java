package com.awardhub.nomination.dto;

import com.awardhub.common.enums.NominationStatus;
import com.awardhub.nomination.entity.Nomination;

import java.time.LocalDateTime;

public class NominationResponseDTO {
    private Long id;
    private Long categoryId;
    private Long nomineeId;
    private String title;
    private String description;
    private String supportingDocument;
    private NominationStatus status;
    private String rejectionReason;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NominationResponseDTO from(Nomination n) {
        NominationResponseDTO r = new NominationResponseDTO();
        r.id = n.getId();
        r.categoryId = n.getCategoryId();
        r.nomineeId = n.getNomineeId();
        r.title = n.getTitle();
        r.description = n.getDescription();
        r.supportingDocument = n.getSupportingDocument();
        r.status = n.getStatus();
        r.rejectionReason = n.getRejectionReason();
        r.reviewedBy = n.getReviewedBy();
        r.reviewedAt = n.getReviewedAt();
        r.createdAt = n.getCreatedAt();
        r.updatedAt = n.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getCategoryId() { return categoryId; }
    public Long getNomineeId() { return nomineeId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSupportingDocument() { return supportingDocument; }
    public NominationStatus getStatus() { return status; }
    public String getRejectionReason() { return rejectionReason; }
    public Long getReviewedBy() { return reviewedBy; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
