package com.awardhub.evaluation.dto;

import com.awardhub.evaluation.model.EvaluationStatus;
import java.math.BigDecimal;

/**
 * One row on the judge's worklist. displayName is already masked when the category runs
 * blind review, so the real nominee name never reaches the browser.
 */
public class JudgeTaskResponse {
    private Long nominationId;
    private Long categoryId;
    private String categoryName;
    private String displayName;
    private EvaluationStatus status;
    private BigDecimal totalScore;
    private Long evaluationId;

    public Long getNominationId() { return nominationId; }
    public void setNominationId(Long v) { this.nominationId = v; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long v) { this.categoryId = v; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String v) { this.categoryName = v; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String v) { this.displayName = v; }
    public EvaluationStatus getStatus() { return status; }
    public void setStatus(EvaluationStatus v) { this.status = v; }
    public BigDecimal getTotalScore() { return totalScore; }
    public void setTotalScore(BigDecimal v) { this.totalScore = v; }
    public Long getEvaluationId() { return evaluationId; }
    public void setEvaluationId(Long v) { this.evaluationId = v; }
}
