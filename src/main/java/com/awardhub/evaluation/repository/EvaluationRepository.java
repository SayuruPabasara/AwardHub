package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.Evaluation;
import com.awardhub.evaluation.model.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByNominationIdAndJudgeId(Long nominationId, Long judgeId);
    List<Evaluation> findByCategoryIdAndStatusIn(Long categoryId, List<EvaluationStatus> statuses);
    List<Evaluation> findByNominationIdAndStatusIn(Long nominationId, List<EvaluationStatus> statuses);
    List<Evaluation> findByJudgeIdAndCategoryId(Long judgeId, Long categoryId);
    long countByCategoryIdAndStatusIn(Long categoryId, List<EvaluationStatus> statuses);
}
