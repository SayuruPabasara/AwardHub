package com.awardhub.evaluation.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CriterionScoreRequest {
    @NotNull private Long criterionId;
    @NotNull private BigDecimal rawScore;
    private String note;

    public Long getCriterionId() { return criterionId; }
    public void setCriterionId(Long criterionId) { this.criterionId = criterionId; }
    public BigDecimal getRawScore() { return rawScore; }
    public void setRawScore(BigDecimal rawScore) { this.rawScore = rawScore; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
