package com.awardhub.category.dto;

import com.awardhub.common.enums.CategoryStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CategoryUpdateRequest {

    @NotNull(message = "Award event is required")
    private Long awardEventId;

    @NotBlank(message = "Category name is required")
    @Size(max = 150, message = "Category name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Category description is required")
    private String description;

    private String rules;

    private String nomineeEligibility;

    private String voterEligibility;

    private String nominationRequirements;

    @NotNull(message = "Nomination start date is required")
    private LocalDateTime nominationStartDate;

    @NotNull(message = "Nomination end date is required")
    private LocalDateTime nominationEndDate;

    @NotNull(message = "Voting start date is required")
    private LocalDateTime votingStartDate;

    @NotNull(message = "Voting end date is required")
    private LocalDateTime votingEndDate;

    @NotNull(message = "Result publication date is required")
    private LocalDateTime resultPublicationDate;

    private CategoryStatus status;

    @NotEmpty(message = "At least one judging criterion is required")
    @Valid
    private List<CategoryCriterionRequest> criteria = new ArrayList<>();

    public CategoryUpdateRequest() {}

    public Long getAwardEventId() {
        return awardEventId;
    }

    public void setAwardEventId(Long awardEventId) {
        this.awardEventId = awardEventId;
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

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getNomineeEligibility() {
        return nomineeEligibility;
    }

    public void setNomineeEligibility(String nomineeEligibility) {
        this.nomineeEligibility = nomineeEligibility;
    }

    public String getVoterEligibility() {
        return voterEligibility;
    }

    public void setVoterEligibility(String voterEligibility) {
        this.voterEligibility = voterEligibility;
    }

    public String getNominationRequirements() {
        return nominationRequirements;
    }

    public void setNominationRequirements(String nominationRequirements) {
        this.nominationRequirements = nominationRequirements;
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

    public CategoryStatus getStatus() {
        return status;
    }

    public void setStatus(CategoryStatus status) {
        this.status = status;
    }

    public List<CategoryCriterionRequest> getCriteria() {
        return criteria;
    }

    public void setCriteria(List<CategoryCriterionRequest> criteria) {
        this.criteria = criteria;
    }
}
