package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.NominationRef;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NominationRefRepository extends JpaRepository<NominationRef, Long> {
    List<NominationRef> findByCategoryIdAndStatus(Long categoryId, String status);
}
