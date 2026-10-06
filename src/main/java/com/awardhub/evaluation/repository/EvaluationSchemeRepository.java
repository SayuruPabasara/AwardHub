package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.EvaluationScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EvaluationSchemeRepository extends JpaRepository<EvaluationScheme, Long> {
    Optional<EvaluationScheme> findByCategoryId(Long categoryId);
}
