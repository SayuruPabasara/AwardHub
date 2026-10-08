package com.awardhub.evaluation.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * The evaluation configuration for one award category.
 *
 * OWNERSHIP NOTE (important when merging with the team):
 * the category itself belongs to Award Category Management. This table only stores the
 * evaluation rules and references the category by id, so the two modules never fight
 * over the same table.
 */
@Entity
@Table(name = "evaluation_scheme",
       uniqueConstraints = @UniqueConstraint(columnNames = "category_id"))
public class EvaluationScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "category_name", length = 150)
    private String categoryName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationMode mode = EvaluationMode.HYBRID;

    /** Share of the final score coming from judges. judgeWeight + publicWeight must equal 1.00 */
    @DecimalMin("0.00") @DecimalMax("1.00")
    @Column(name = "judge_weight", precision = 5, scale = 4, nullable = false)
    private BigDecimal judgeWeight = new BigDecimal("0.7000");

    @DecimalMin("0.00") @DecimalMax("1.00")
    @Column(name = "public_weight", precision = 5, scale = 4, nullable = false)
    private BigDecimal publicWeight = new BigDecimal("0.3000");

    @Enumerated(EnumType.STRING)
    @Column(name = "aggregation_method", nullable = false, length = 20)
    private AggregationMethod aggregationMethod = AggregationMethod.MEAN;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_normalization", nullable = false, length = 20)
    private VoteNormalization voteNormalization = VoteNormalization.MAX_IN_CATEGORY;

    /** A nominee with fewer submitted evaluations than this is excluded from the result set. */
    @Min(1)
    @Column(name = "min_judges_required", nullable = false)
    private int minJudgesRequired = 1;

    /** When true, judges see "Nominee A" instead of the real name while scoring. */
    @Column(name = "blind_review", nullable = false)
    private boolean blindReview = true;

    /** Once locked, the rubric and weights cannot change - matches the "fixed cycle rules" constraint. */
    @Column(nullable = false)
    private boolean locked = false;

    @Column(name = "evaluation_opens_at")
    private LocalDateTime evaluationOpensAt;

    @Column(name = "evaluation_closes_at")
    private LocalDateTime evaluationClosesAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public EvaluationMode getMode() { return mode; }
    public void setMode(EvaluationMode mode) { this.mode = mode; }
    public BigDecimal getJudgeWeight() { return judgeWeight; }
    public void setJudgeWeight(BigDecimal judgeWeight) { this.judgeWeight = judgeWeight; }
    public BigDecimal getPublicWeight() { return publicWeight; }
    public void setPublicWeight(BigDecimal publicWeight) { this.publicWeight = publicWeight; }
    public AggregationMethod getAggregationMethod() { return aggregationMethod; }
    public void setAggregationMethod(AggregationMethod m) { this.aggregationMethod = m; }
    public VoteNormalization getVoteNormalization() { return voteNormalization; }
    public void setVoteNormalization(VoteNormalization v) { this.voteNormalization = v; }
    public int getMinJudgesRequired() { return minJudgesRequired; }
    public void setMinJudgesRequired(int minJudgesRequired) { this.minJudgesRequired = minJudgesRequired; }
    public boolean isBlindReview() { return blindReview; }
    public void setBlindReview(boolean blindReview) { this.blindReview = blindReview; }
    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
    public LocalDateTime getEvaluationOpensAt() { return evaluationOpensAt; }
    public void setEvaluationOpensAt(LocalDateTime t) { this.evaluationOpensAt = t; }
    public LocalDateTime getEvaluationClosesAt() { return evaluationClosesAt; }
    public void setEvaluationClosesAt(LocalDateTime t) { this.evaluationClosesAt = t; }
}
