package com.awardhub.pattern.voting;

import com.awardhub.dto.DTOs.VotingCreateRequest;
import com.awardhub.entity.Voting;
import org.springframework.stereotype.Component;

/**
 * SINGLETON PATTERN (Creational) — Voting Management, classic form per lecture Part I.
 * Private constructor + static getInstance(). Delegates creation to VotingFactory.
 * (Spring beans are also singletons, but this shows the textbook structure explicitly.)
 */
@Component
public final class VotingManager {

    private static volatile VotingManager instance;

    // Spring creates the bean; the static accessor exposes the single instance.
    public VotingManager() {
        instance = this;
    }

    public static VotingManager getInstance() {
        if (instance == null) {
            synchronized (VotingManager.class) {
                if (instance == null) {
                    instance = new VotingManager();
                }
            }
        }
        return instance;
    }

    public Voting newVoting(VotingCreateRequest req) {
        return VotingFactory.create(req);
    }
}
