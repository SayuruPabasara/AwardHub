package com.awardhub.vote.repository;

import com.awardhub.vote.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByVoterIdAndCategoryId(Long voterId, Long categoryId);

    boolean existsByCategoryIdAndNicIgnoreCase(Long categoryId, String nic);

    Optional<Vote> findByVoterIdAndCategoryId(Long voterId, Long categoryId);

    List<Vote> findByVoterId(Long voterId);

    long countByCategoryId(Long categoryId);

    long countByNominationId(Long nominationId);

    @Query("SELECT v.nomination.id, COUNT(v.id) FROM Vote v WHERE v.categoryId = :categoryId GROUP BY v.nomination.id")
    List<Object[]> countVotesGroupedByNomination(@Param("categoryId") Long categoryId);
}
