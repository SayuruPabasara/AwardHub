package com.awardhub.category.dto;

import java.time.LocalDateTime;

public class JudgeResponse {

    private Long id; // assignment ID
    private Long judgeId;
    private String email;
    private String fullName;
    private LocalDateTime assignedAt;
    private String assignedBy;

    public JudgeResponse() {}

    public JudgeResponse(Long id, Long judgeId, String email, String fullName, LocalDateTime assignedAt, String assignedBy) {
        this.id = id;
        this.judgeId = judgeId;
        this.email = email;
        this.fullName = fullName;
        this.assignedAt = assignedAt;
        this.assignedBy = assignedBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJudgeId() {
        return judgeId;
    }

    public void setJudgeId(Long judgeId) {
        this.judgeId = judgeId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }
}
