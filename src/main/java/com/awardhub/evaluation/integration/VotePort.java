package com.awardhub.evaluation.integration;

import java.util.Map;

/**
 * The only thing Module 5 asks of Voting Management: final verified vote counts for a
 * category, as nominationId -> votes. Vote validation, duplicate prevention and voter
 * eligibility all stay on Fernando's side of the line.
 */
public interface VotePort {
    Map<Long, Long> voteCounts(Long categoryId);
}
