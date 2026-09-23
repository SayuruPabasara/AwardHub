package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.ResultSet;
import com.awardhub.evaluation.model.ResultStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResultSetRepository extends JpaRepository<ResultSet, Long> {
    Optional<ResultSet> findFirstByCategoryIdOrderByVersionNoDesc(Long categoryId);
    Optional<ResultSet> findFirstByCategoryIdAndStatusOrderByVersionNoDesc(Long categoryId, ResultStatus status);
    List<ResultSet> findByStatus(ResultStatus status);
}
