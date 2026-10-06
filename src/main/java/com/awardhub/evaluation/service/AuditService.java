package com.awardhub.evaluation.service;

import com.awardhub.evaluation.model.EvaluationAuditLog;
import com.awardhub.evaluation.repository.EvaluationAuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final EvaluationAuditLogRepository repository;

    public AuditService(EvaluationAuditLogRepository repository) {
        this.repository = repository;
    }

    public void record(Long actorId, String action, String entityType, Long entityId, String detail) {
        repository.save(new EvaluationAuditLog(actorId, action, entityType, entityId, detail));
    }

    public List<EvaluationAuditLog> recent() {
        return repository.findTop100ByOrderByOccurredAtDesc();
    }
}
