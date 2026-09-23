package com.awardhub.evaluation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

/** The raw score a judge gave for one criterion, on the rubric's scale (e.g. 1-10). */
@Entity
@Table(name = "criterion_score",
       uniqueConstraints = @UniqueConstraint(columnNames = {"evaluation_id", "criterion_id"}))
public class CriterionScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    @JsonIgnore
    private Evaluation evaluation;

    @Column(name = "criterion_id", nullable = false)
    private Long criterionId;

    @Column(name = "raw_score", precision = 7, scale = 2, nullable = false)
    private BigDecimal rawScore;

    @Column(length = 400)
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Evaluation getEvaluation() { return evaluation; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }
    public Long getCriterionId() { return criterionId; }
    public void setCriterionId(Long criterionId) { this.criterionId = criterionId; }
    public BigDecimal getRawScore() { return rawScore; }
    public void setRawScore(BigDecimal rawScore) { this.rawScore = rawScore; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
