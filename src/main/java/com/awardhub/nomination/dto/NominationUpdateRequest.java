package com.awardhub.nomination.dto;

/** Edits allowed only while the nomination is still DRAFT, by its owner. */
public class NominationUpdateRequest {
    private String title;
    private String description;
    private String supportingDocument;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSupportingDocument() { return supportingDocument; }
    public void setSupportingDocument(String supportingDocument) { this.supportingDocument = supportingDocument; }
}
