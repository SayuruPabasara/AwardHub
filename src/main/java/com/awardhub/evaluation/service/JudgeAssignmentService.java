package com.awardhub.evaluation.service;

import com.awardhub.evaluation.exception.BusinessRuleException;
import com.awardhub.evaluation.exception.ResourceNotFoundException;
import com.awardhub.evaluation.model.AssignmentStatus;
import com.awardhub.evaluation.model.JudgeAssignment;
import com.awardhub.evaluation.repository.JudgeAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JudgeAssignmentService {

    private final JudgeAssignmentRepository repository;
    private final AuditService audit;

    public JudgeAssignmentService(JudgeAssignmentRepository repository, AuditService audit) {
        this.repository = repository;
        this.audit = audit;
    }

    public List<JudgeAssignment> forCategory(Long categoryId) {
        return repository.findByCategoryId(categoryId);
    }

    public List<JudgeAssignment> forJudge(Long judgeId) {
        return repository.findByJudgeIdAndStatusNot(judgeId, AssignmentStatus.REVOKED);
    }

    @Transactional
    public JudgeAssignment assign(JudgeAssignment assignment, Long actorId) {
        repository.findByCategoryIdAndJudgeId(assignment.getCategoryId(), assignment.getJudgeId())
                .ifPresent(a -> {
                    throw new BusinessRuleException("That judge is already assigned to this category.");
                });
        JudgeAssignment saved = repository.save(assignment);
        audit.record(actorId, "JUDGE_ASSIGNED", "JudgeAssignment", saved.getId(),
                "judgeId=" + saved.getJudgeId() + " categoryId=" + saved.getCategoryId());
        return saved;
    }

    /**
     * Revoking rather than deleting. An assignment that produced scores is part of the
     * record of how a result was reached, so it is kept and marked instead of removed.
     */
    @Transactional
    public JudgeAssignment revoke(Long id, String reason, Long actorId) {
        JudgeAssignment a = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Judge assignment", id));
        a.setStatus(AssignmentStatus.REVOKED);
        a.setConflictNote(reason);
        audit.record(actorId, "JUDGE_REVOKED", "JudgeAssignment", id, reason);
        return repository.save(a);
    }

    @Transactional
    public void markInProgress(Long categoryId, Long judgeId) {
        repository.findByCategoryIdAndJudgeId(categoryId, judgeId).ifPresent(a -> {
            if (a.getStatus() == AssignmentStatus.ASSIGNED) {
                a.setStatus(AssignmentStatus.IN_PROGRESS);
                repository.save(a);
            }
        });
    }

    public long activeJudgeCount(Long categoryId) {
        return repository.countByCategoryIdAndStatusNot(categoryId, AssignmentStatus.REVOKED);
    }
}
