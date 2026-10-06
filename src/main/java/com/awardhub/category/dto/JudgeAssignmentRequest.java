package com.awardhub.category.dto;

import jakarta.validation.constraints.NotNull;

public class JudgeAssignmentRequest {

    @NotNull(message = "Judge ID is required")
    private Long judgeId;

    private String notes;

    public JudgeAssignmentRequest() {}

    public JudgeAssignmentRequest(Long judgeId, String notes) {
        this.judgeId = judgeId;
        this.notes = notes;
    }

    public Long getJudgeId() {
        return judgeId;
    }

    public void setJudgeId(Long judgeId) {
        this.judgeId = judgeId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
