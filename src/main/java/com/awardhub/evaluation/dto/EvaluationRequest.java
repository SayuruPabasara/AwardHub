package com.awardhub.evaluation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** What a judge sends when saving a draft or submitting a final evaluation. */
public class EvaluationRequest {
    @NotNull private Long nominationId;
    @NotNull private Long judgeId;
    @NotEmpty @Valid private List<CriterionScoreRequest> scores;
    private String comments;
    /** false = save draft, true = submit and lock. */
    private boolean submit = false;

    public Long getNominationId() { return nominationId; }
    public void setNominationId(Long nominationId) { this.nominationId = nominationId; }
    public Long getJudgeId() { return judgeId; }
    public void setJudgeId(Long judgeId) { this.judgeId = judgeId; }
    public List<CriterionScoreRequest> getScores() { return scores; }
    public void setScores(List<CriterionScoreRequest> scores) { this.scores = scores; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public boolean isSubmit() { return submit; }
    public void setSubmit(boolean submit) { this.submit = submit; }
}
