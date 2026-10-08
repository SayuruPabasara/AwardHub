package com.awardhub.evaluation.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A calculated ranking for one category at one point in time.
 * The weights are copied in (snapshotted) so a published result can always be explained,
 * even if the organizer later changes the scheme.
 */
@Entity
@Table(name = "result_set")
public class ResultSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResultStatus status = ResultStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_snapshot", length = 20)
    private EvaluationMode modeSnapshot;

    @Column(name = "judge_weight_snapshot", precision = 5, scale = 4)
    private BigDecimal judgeWeightSnapshot;

    @Column(name = "public_weight_snapshot", precision = 5, scale = 4)
    private BigDecimal publicWeightSnapshot;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    private Long publishedBy;

    /** Filled when a published set is re-opened, so the change is explainable at audit. */
    @Column(name = "recalculation_reason", length = 400)
    private String recalculationReason;

    @Column(name = "version_no", nullable = false)
    private int versionNo = 1;

    @OneToMany(mappedBy = "resultSet", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.EAGER)
    @OrderBy("rankPosition ASC")
    private List<ResultEntry> entries = new ArrayList<>();

    public void addEntry(ResultEntry e) {
        e.setResultSet(this);
        this.entries.add(e);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }
    public EvaluationMode getModeSnapshot() { return modeSnapshot; }
    public void setModeSnapshot(EvaluationMode m) { this.modeSnapshot = m; }
    public BigDecimal getJudgeWeightSnapshot() { return judgeWeightSnapshot; }
    public void setJudgeWeightSnapshot(BigDecimal w) { this.judgeWeightSnapshot = w; }
    public BigDecimal getPublicWeightSnapshot() { return publicWeightSnapshot; }
    public void setPublicWeightSnapshot(BigDecimal w) { this.publicWeightSnapshot = w; }
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime t) { this.calculatedAt = t; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime t) { this.publishedAt = t; }
    public Long getPublishedBy() { return publishedBy; }
    public void setPublishedBy(Long publishedBy) { this.publishedBy = publishedBy; }
    public String getRecalculationReason() { return recalculationReason; }
    public void setRecalculationReason(String r) { this.recalculationReason = r; }
    public int getVersionNo() { return versionNo; }
    public void setVersionNo(int versionNo) { this.versionNo = versionNo; }
    public List<ResultEntry> getEntries() { return entries; }
    public void setEntries(List<ResultEntry> entries) { this.entries = entries; }
}
