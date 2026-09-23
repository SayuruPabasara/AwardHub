package com.awardhub.evaluation.dto;

import jakarta.validation.constraints.NotNull;

public class PublishRequest {
    @NotNull private Long organizerId;
    private String note;

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
