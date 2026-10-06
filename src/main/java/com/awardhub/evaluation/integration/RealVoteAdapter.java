package com.awardhub.evaluation.integration;

import com.awardhub.vote.repository.VoteRepository;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Real adapter backed by the actual votes table.
 * Queries the Vote repository grouped by nomination for the given category.
 */
@Component
public class RealVoteAdapter implements VotePort {

    private final VoteRepository voteRepository;

    public RealVoteAdapter(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    @Override
    public Map<Long, Long> voteCounts(Long categoryId) {
        Map<Long, Long> out = new LinkedHashMap<>();
        List<Object[]> results = voteRepository.countVotesGroupedByNomination(categoryId);
        for (Object[] row : results) {
            Long nominationId = (Long) row[0];
            Long count = ((Number) row[1]).longValue();
            out.put(nominationId, count);
        }
        return out;
    }
}
