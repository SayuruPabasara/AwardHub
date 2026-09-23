package com.awardhub.evaluation.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** One judge's scoring of one nomination. */
@Entity
@Table(name = "evaluation",
       uniqueConstraints = @UniqueConstraint(columnNames = {"nomination_id", "judge_id"}))
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nomination id from Nomination Management. Only APPROVED nominations reach this module. */
    @Column(name = "nomination_id", nullable = false)
    private Long nominationId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "judge_id", nullable = false)
    private Long judgeId;

    @Column(name = "rubric_id", nullable = false)
    private Long rubricId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationStatus status = EvaluationStatus.DRAFT;

    /** Weighted, normalised 0-100 score for this single judge. Computed on submit. */
    @Column(name = "total_score", precision = 7, scale = 4)
    private BigDecimal totalScore;

    @Column(length = 1000)
    private String comments;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.EAGER)
    private List<CriterionScore> scores = new ArrayList<>();

    public void addScore(CriterionScore s) {
        s.setEvaluation(this);
        this.scores.add(s);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getNominationId() { return nominationId; }
    public void setNominationId(Long nominationId) { this.nominationId = nominationId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getJudgeId() { return judgeId; }
    public void setJudgeId(Long judgeId) { this.judgeId = judgeId; }
    public Long getRubricId() { return rubricId; }
    public void setRubricId(Long rubricId) { this.rubricId = rubricId; }
    public EvaluationStatus getStatus() { return status; }
    public void setStatus(EvaluationStatus status) { this.status = status; }
    public BigDecimal getTotalScore() { return totalScore; }
    public void setTotalScore(BigDecimal totalScore) { this.totalScore = totalScore; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<CriterionScore> getScores() { return scores; }
    public void setScores(List<CriterionScore> scores) { this.scores = scores; }
}
