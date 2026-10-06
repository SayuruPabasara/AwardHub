package com.awardhub.nomination.repository;

import com.awardhub.common.enums.NominationStatus;
import com.awardhub.nomination.entity.Nomination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NominationRepository extends JpaRepository<Nomination, Long> {

    List<Nomination> findByCategoryIdAndStatus(Long categoryId, NominationStatus status);

    Optional<Nomination> findByIdAndCategoryId(Long id, Long categoryId);

    // Added for the nomination workflow rebuild:
    List<Nomination> findByNomineeId(Long nomineeId);

    List<Nomination> findByCategoryId(Long categoryId);

    List<Nomination> findByCategoryIdAndStatusIn(Long categoryId, List<NominationStatus> statuses);
}
