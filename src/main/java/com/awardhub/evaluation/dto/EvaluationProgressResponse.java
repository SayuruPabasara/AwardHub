package com.awardhub.evaluation.dto;

/** Organizer's readiness view: can this category's results be calculated yet? */
public class EvaluationProgressResponse {
    private Long categoryId;
    private int nominations;
    private int judges;
    private int expectedEvaluations;
    private int submittedEvaluations;
    private boolean readyToCalculate;
    private String blocker;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long v) { this.categoryId = v; }
    public int getNominations() { return nominations; }
    public void setNominations(int v) { this.nominations = v; }
    public int getJudges() { return judges; }
    public void setJudges(int v) { this.judges = v; }
    public int getExpectedEvaluations() { return expectedEvaluations; }
    public void setExpectedEvaluations(int v) { this.expectedEvaluations = v; }
    public int getSubmittedEvaluations() { return submittedEvaluations; }
    public void setSubmittedEvaluations(int v) { this.submittedEvaluations = v; }
    public boolean isReadyToCalculate() { return readyToCalculate; }
    public void setReadyToCalculate(boolean v) { this.readyToCalculate = v; }
    public String getBlocker() { return blocker; }
    public void setBlocker(String v) { this.blocker = v; }
}
