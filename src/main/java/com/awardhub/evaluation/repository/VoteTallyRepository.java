package com.awardhub.evaluation.repository;

import com.awardhub.evaluation.model.VoteTally;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoteTallyRepository extends JpaRepository<VoteTally, Long> {
    List<VoteTally> findByCategoryId(Long categoryId);
}
