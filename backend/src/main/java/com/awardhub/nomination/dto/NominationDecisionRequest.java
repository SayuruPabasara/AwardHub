package com.awardhub.nomination.dto;

/** Body for POST /reject — rejectionReason is required (checked in the service). */
public class NominationDecisionRequest {
    private String rejectionReason;

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
