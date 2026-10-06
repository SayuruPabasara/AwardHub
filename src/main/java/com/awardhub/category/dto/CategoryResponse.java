package com.awardhub.category.dto;

import com.awardhub.common.enums.CategoryStatus;
import java.time.LocalDateTime;

public class CategoryResponse {

    private Long id;
    private Long awardEventId;
    private String awardEventName;
    private String name;
    private String description;
    private CategoryStatus status;
    private LocalDateTime nominationStartDate;
    private LocalDateTime nominationEndDate;
    private LocalDateTime votingStartDate;
    private LocalDateTime votingEndDate;
    private LocalDateTime resultPublicationDate;
    private int criteriaCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime archivedAt;

    public CategoryResponse() {}

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

    public LocalDateTime getNominationStartDate() {
        return nominationStartDate;
    }

    public void setNominationStartDate(LocalDateTime nominationStartDate) {
        this.nominationStartDate = nominationStartDate;
    }

    public LocalDateTime getNominationEndDate() {
        return nominationEndDate;
    }

    public void setNominationEndDate(LocalDateTime nominationEndDate) {
        this.nominationEndDate = nominationEndDate;
    }

    public LocalDateTime getVotingStartDate() {
        return votingStartDate;
    }

    public void setVotingStartDate(LocalDateTime votingStartDate) {
        this.votingStartDate = votingStartDate;
    }

    public LocalDateTime getVotingEndDate() {
        return votingEndDate;
    }

    public void setVotingEndDate(LocalDateTime votingEndDate) {
        this.votingEndDate = votingEndDate;
    }

    public LocalDateTime getResultPublicationDate() {
        return resultPublicationDate;
    }

    public void setResultPublicationDate(LocalDateTime resultPublicationDate) {
        this.resultPublicationDate = resultPublicationDate;
    }

    public int getCriteriaCount() {
        return criteriaCount;
    }

    public void setCriteriaCount(int criteriaCount) {
        this.criteriaCount = criteriaCount;
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
}
