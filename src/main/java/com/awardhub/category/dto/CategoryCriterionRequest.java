package com.awardhub.category.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CategoryCriterionRequest {

    private Long id;

    @NotBlank(message = "Criterion name is required")
    @Size(max = 150, message = "Criterion name cannot exceed 150 characters")
    private String criterionName;

    private String description;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0")
    @DecimalMax(value = "100.00", message = "Weight cannot exceed 100")
    private BigDecimal weight;

    @NotNull(message = "Maximum score is required")
    @Positive(message = "Maximum score must be greater than 0")
    private Integer maxScore;

    public CategoryCriterionRequest() {}

    public CategoryCriterionRequest(String criterionName, String description, BigDecimal weight, Integer maxScore) {
        this.criterionName = criterionName;
        this.description = description;
        this.weight = weight;
        this.maxScore = maxScore;
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
}
