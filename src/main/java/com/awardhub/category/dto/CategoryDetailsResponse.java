package com.awardhub.category.dto;

import java.util.ArrayList;
import java.util.List;

public class CategoryDetailsResponse extends CategoryResponse {

    private String rules;
    private String nomineeEligibility;
    private String voterEligibility;
    private String nominationRequirements;
    private String createdBy;
    private List<CategoryCriterionResponse> criteria = new ArrayList<>();
    private List<JudgeResponse> assignedJudges = new ArrayList<>();

    public CategoryDetailsResponse() {}

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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public List<CategoryCriterionResponse> getCriteria() {
        return criteria;
    }

    public void setCriteria(List<CategoryCriterionResponse> criteria) {
        this.criteria = criteria;
    }

    public List<JudgeResponse> getAssignedJudges() {
        return assignedJudges;
    }

    public void setAssignedJudges(List<JudgeResponse> assignedJudges) {
        this.assignedJudges = assignedJudges;
    }
}
