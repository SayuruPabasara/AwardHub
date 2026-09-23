package com.awardhub.evaluation.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Links a judge to a category. Judges evaluate every approved nomination in that category. */
@Entity
@Table(name = "judge_assignment",
       uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "judge_id"}))
public class JudgeAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    /** User id from the shared user table (System Administrator module). */
    @Column(name = "judge_id", nullable = false)
    private Long judgeId;

    @Column(name = "judge_name", length = 120)
    private String judgeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.ASSIGNED;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    /** Set when the judge declares a conflict of interest for a nomination. */
    @Column(name = "conflict_note", length = 300)
    private String conflictNote;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getJudgeId() { return judgeId; }
    public void setJudgeId(Long judgeId) { this.judgeId = judgeId; }
    public String getJudgeName() { return judgeName; }
    public void setJudgeName(String judgeName) { this.judgeName = judgeName; }
    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public String getConflictNote() { return conflictNote; }
    public void setConflictNote(String conflictNote) { this.conflictNote = conflictNote; }
}
