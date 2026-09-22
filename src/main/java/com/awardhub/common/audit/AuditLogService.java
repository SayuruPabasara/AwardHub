package com.awardhub.common.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service for recording audit log entries.
 * Called by other services whenever an auditable action occurs.
 */
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long userId, String actionType, String entityType,
                    Long entityId, String details) {
        AuditLog entry = AuditLog.builder()
                .performedByUserId(userId)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }

    public void log(String actionType, String details) {
        AuditLog entry = AuditLog.builder()
                .actionType(actionType)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }
}
