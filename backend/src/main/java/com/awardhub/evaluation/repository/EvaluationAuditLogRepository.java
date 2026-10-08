package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.EvaluationAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvaluationAuditLogRepository extends JpaRepository<EvaluationAuditLog, Long> {
    List<EvaluationAuditLog> findTop100ByOrderByOccurredAtDesc();
}
