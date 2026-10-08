package com.awardhub.category.dto;

import com.awardhub.common.enums.CategoryStatus;
import java.time.LocalDateTime;

public class VoterCategoryResponse {

    private Long id;
    private Long awardEventId;
    private String awardEventName;
    private String name;
    private String description;
    private String rules;
    private String voterEligibility;
    private LocalDateTime votingStartDate;
    private LocalDateTime votingEndDate;
    private CategoryStatus status;
    private boolean isVotingOpen;

    public VoterCategoryResponse() {}

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

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getVoterEligibility() {
        return voterEligibility;
    }

    public void setVoterEligibility(String voterEligibility) {
        this.voterEligibility = voterEligibility;
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

    public CategoryStatus getStatus() {
        return status;
    }

    public void setStatus(CategoryStatus status) {
        this.status = status;
    }

    public boolean isVotingOpen() {
        return isVotingOpen;
    }

    public void setVotingOpen(boolean votingOpen) {
        isVotingOpen = votingOpen;
    }
}
