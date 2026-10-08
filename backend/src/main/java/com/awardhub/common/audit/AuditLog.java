package com.awardhub.common.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Generic audit trail entry.
 * Mapped to table `audit_logs` adhering to the integrated relational schema.
 */
@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id")
    private Long performedByUserId;

    @Column(name = "action", nullable = false, length = 100)
    private String actionType;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public Long getLogID() {
        return this.id;
    }

    public void setLogID(Long logID) {
        this.id = logID;
    }
}
