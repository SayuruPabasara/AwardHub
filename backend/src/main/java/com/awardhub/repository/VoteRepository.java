package com.awardhub.repository;

import com.awardhub.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByVoterIdAndVotingId(Long voterId, Long votingId);
    List<Vote> findByVoterId(Long voterId);
    long countByVotingId(Long votingId);
    boolean existsByVoterIdAndVotingId(Long voterId, Long votingId);
    boolean existsByVotingIdAndNicIgnoreCase(Long votingId, String nic);
}
