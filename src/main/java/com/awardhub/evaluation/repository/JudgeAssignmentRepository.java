package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.AssignmentStatus;
import com.awardhub.evaluation.model.JudgeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Long> {
    List<JudgeAssignment> findByCategoryId(Long categoryId);
    List<JudgeAssignment> findByJudgeIdAndStatusNot(Long judgeId, AssignmentStatus status);
    Optional<JudgeAssignment> findByCategoryIdAndJudgeId(Long categoryId, Long judgeId);
    long countByCategoryIdAndStatusNot(Long categoryId, AssignmentStatus status);
}
