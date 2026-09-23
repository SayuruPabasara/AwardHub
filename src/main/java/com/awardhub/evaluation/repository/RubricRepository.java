package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.Rubric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RubricRepository extends JpaRepository<Rubric, Long> {
    Optional<Rubric> findByCategoryIdAndActiveTrue(Long categoryId);
    List<Rubric> findByCategoryIdOrderByVersionDesc(Long categoryId);
}
