package com.awardhub.evaluation.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Append-only record of every decision this module makes. Never updated, never deleted. */
@Entity
@Table(name = "evaluation_audit_log")
public class EvaluationAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(nullable = false, length = 60)
    private String action;

    @Column(name = "entity_type", length = 40)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(length = 600)
    private String detail;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt = LocalDateTime.now();

    public EvaluationAuditLog() { }

    public EvaluationAuditLog(Long actorId, String action, String entityType, Long entityId, String detail) {
        this.actorId = actorId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.detail = detail;
    }

    public Long getId() { return id; }
    public Long getActorId() { return actorId; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getDetail() { return detail; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}
