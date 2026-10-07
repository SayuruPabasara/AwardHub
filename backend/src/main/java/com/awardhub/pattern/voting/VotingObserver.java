package com.awardhub.pattern.voting;

import com.awardhub.entity.User;
import com.awardhub.entity.Voting;

/**
 * OBSERVER PATTERN (Behavioral) — Voting Management.
 * Lecture mapping: Part I "Observer Pattern" (Subject/Observer/notifyObservers).
 */
public interface VotingObserver {
    void onVotingChanged(Voting voting, String event, User actor, String ip);
}
