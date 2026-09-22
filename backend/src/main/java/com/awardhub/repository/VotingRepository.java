package com.awardhub.repository;

import com.awardhub.entity.Voting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface VotingRepository extends JpaRepository<Voting, Long> {
    Optional<Voting> findByHeadOrganizerId(Long headOrganizerId);
    List<Voting> findAllByHeadOrganizerId(Long headOrganizerId);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
