package com.awardhub.nomination.repository;

import com.awardhub.nomination.entity.Nomination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NominationRepository extends JpaRepository<Nomination, Long> {

    List<Nomination> findByNomineeId(Long nomineeId);

    List<Nomination> findByCategoryId(Long categoryId);

    List<Nomination> findByStatus(String status);
}
