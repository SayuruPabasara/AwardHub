package com.awardhub.category.entity;

import com.awardhub.common.enums.CategoryStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "categories",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_award_event_category_name", columnNames = {"award_event_id", "name"})
    },
    indexes = {
        @Index(name = "idx_category_event", columnList = "award_event_id"),
        @Index(name = "idx_category_status", columnList = "status")
    }
)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "award_event_id", nullable = false)
    private Long awardEventId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Column(name = "nominee_eligibility", columnDefinition = "TEXT")
    private String nomineeEligibility;

    @Column(name = "voter_eligibility", columnDefinition = "TEXT")
    private String voterEligibility;

    @Column(name = "nomination_requirements", columnDefinition = "TEXT")
    private String nominationRequirements;

    @Column(name = "nomination_start_date", nullable = false)
    private LocalDateTime nominationStartDate;

    @Column(name = "nomination_end_date", nullable = false)
    private LocalDateTime nominationEndDate;

    @Column(name = "voting_start_date", nullable = false)
    private LocalDateTime votingStartDate;

    @Column(name = "voting_end_date", nullable = false)
    private LocalDateTime votingEndDate;

    @Column(name = "result_publication_date", nullable = false)
    private LocalDateTime resultPublicationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoryStatus status = CategoryStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<CategoryCriterion> criteria = new ArrayList<>();

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CategoryJudge> judgeAssignments = new ArrayList<>();

    public Category() {}

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = CategoryStatus.DRAFT;
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addCriterion(CategoryCriterion criterion) {
        criteria.add(criterion);
        criterion.setCategory(this);
    }

    public void removeCriterion(CategoryCriterion criterion) {
        criteria.remove(criterion);
        criterion.setCategory(null);
    }

    public void clearCriteria() {
        for (CategoryCriterion criterion : new ArrayList<>(criteria)) {
            removeCriterion(criterion);
        }
    }

    // Getters and Setters
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

    public List<CategoryCriterion> getCriteria() {
        return criteria;
    }

    public void setCriteria(List<CategoryCriterion> criteria) {
        this.criteria = criteria;
    }

    public List<CategoryJudge> getJudgeAssignments() {
        return judgeAssignments;
    }

    public void setJudgeAssignments(List<CategoryJudge> judgeAssignments) {
        this.judgeAssignments = judgeAssignments;
    }
}
//parent class of category