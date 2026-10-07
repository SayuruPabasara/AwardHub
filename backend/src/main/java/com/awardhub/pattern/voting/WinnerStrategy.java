package com.awardhub.pattern.voting;

import com.awardhub.entity.Nomination;
import com.awardhub.entity.Voting;

import java.util.List;
import java.util.Optional;

/**
 * STRATEGY PATTERN (Behavioral) — Voting Management.
 * Lecture mapping: Part II "Strategy Pattern" (Payment/Sorting example).
 * Family of winner-picking algorithms, interchangeable at runtime.
 */
public interface WinnerStrategy {
    String key();
    Optional<Nomination> pickWinner(Voting voting, List<Nomination> approvedNominations);
}
