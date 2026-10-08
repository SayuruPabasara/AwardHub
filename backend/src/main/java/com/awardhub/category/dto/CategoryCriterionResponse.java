package com.awardhub.category.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CategoryCriterionResponse {

    private Long id;
    private String criterionName;
    private String description;
    private BigDecimal weight;
    private Integer maxScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CategoryCriterionResponse() {}

    public CategoryCriterionResponse(Long id, String criterionName, String description, BigDecimal weight, Integer maxScore, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.criterionName = criterionName;
        this.description = description;
        this.weight = weight;
        this.maxScore = maxScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCriterionName() {
        return criterionName;
    }

    public void setCriterionName(String criterionName) {
        this.criterionName = criterionName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
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
}
