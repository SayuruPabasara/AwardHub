package com.awardhub.nomination.dto;

/**
 * INTEGRATION FIX (nomination workflow rebuild): replaces the old
 * NominationRequestDTO, which let the client set nomineeId, status, and
 * rejectionReason directly — meaning any caller could nominate someone else
 * and mark the nomination APPROVED in the same request, with no review step
 * and (until this fix) no authentication check on the endpoint at all.
 * nomineeId now comes from the authenticated principal; status always starts
 * at DRAFT; rejectionReason is only ever set by the organizer decision flow.
 */
public class NominationCreateRequest {
    private Long categoryId;
    private String title;
    private String description;
    private String supportingDocument;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSupportingDocument() { return supportingDocument; }
    public void setSupportingDocument(String supportingDocument) { this.supportingDocument = supportingDocument; }
}
