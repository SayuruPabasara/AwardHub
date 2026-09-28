package com.awardhub.category.dto;

import com.awardhub.common.enums.CategoryStatus;
import java.time.LocalDateTime;

public class AdminCategoryResponse {

    private Long id;
    private Long awardEventId;
    private String awardEventName;
    private String name;
    private String description;
    private CategoryStatus status;
    private int criteriaCount;
    private int judgeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime archivedAt;
    private String createdBy;

    public AdminCategoryResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAwardEventId() {
        return awardEventId;
    }

    public void setAwardEventId(Long awardEventId) {
        this.awardEventId = awardEventId;
    }

    public String getAwardEventName() {
        return awardEventName;
    }

    public void setAwardEventName(String awardEventName) {
        this.awardEventName = awardEventName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CategoryStatus getStatus() {
        return status;
    }

    public void setStatus(CategoryStatus status) {
        this.status = status;
    }

    public int getCriteriaCount() {
        return criteriaCount;
    }

    public void setCriteriaCount(int criteriaCount) {
        this.criteriaCount = criteriaCount;
    }

    public int getJudgeCount() {
        return judgeCount;
    }

    public void setJudgeCount(int judgeCount) {
        this.judgeCount = judgeCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
