package com.awardhub.common.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Generic audit trail entry.
 *
 * NOTE for the team: the requirement-gathering report scopes AuditLog narrowly
 * (adminID FK -> SystemAdministrator, timestamp, actionType — logged only for
 * admin actions). This version is broadened to `performedByUserId` so any
 * module (not just the admin module) can log actions such as a nominee
 * updating their own profile. This was added as a stand-in to unblock the
 * Nominee Profile module, since no AuditLog table existed yet anywhere in the
 * codebase — the team should confirm this shape (or replace it) once the
 * shared/admin module owner builds the real audit log feature.
 */
@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logID;

    private Long performedByUserId;

    private String actionType;

    private String entityType;

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
