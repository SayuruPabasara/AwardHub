package com.awardhub.pattern.voting;

import com.awardhub.dto.DTOs.VotingCreateRequest;
import com.awardhub.entity.Voting;

import java.time.LocalDate;
import java.util.Locale;

/**
 * FACTORY PATTERN (Creational) — Voting Management.
 * Hides Voting creation details from VotingService / controllers.
 * Lecture mapping: Part II "Factory Pattern" (Vehicle/Car/Bike/Truck example).
 */
public final class VotingFactory {

    private VotingFactory() {}

    public static Voting create(VotingCreateRequest req) {
        Voting v = new Voting();
        apply(v, req);
        v.setStatus(initialStatus(req));
        return v;
    }

    public static void apply(Voting v, VotingCreateRequest req) {
        v.setName(req.name());
        v.setDescription(req.description());
        v.setEligibility(req.eligibility());
        v.setImageUrl(req.imageUrl());
        v.setHasJudging(req.hasJudging());
        v.setNominationStart(req.nominationStart());
        v.setNominationEnd(req.nominationEnd());
        v.setVotingStart(req.votingStart());
        v.setVotingEnd(req.votingEnd());
        v.setJudgingStart(req.judgingStart());
        v.setJudgingEnd(req.judgingEnd());
    }

    public static Voting.Status parseStatusOrDefault(String raw, Voting.Status fallback) {
        if (raw == null || raw.isBlank()) return fallback;
        try {
            return Voting.Status.valueOf(raw.toLowerCase(Locale.ROOT));
        } catch (Exception e) {
            return fallback;
        }
    }

    private static Voting.Status initialStatus(VotingCreateRequest req) {
        LocalDate today = LocalDate.now();
        if (req.votingStart() != null && !today.isBefore(req.votingStart())
                && req.votingEnd() != null && !today.isAfter(req.votingEnd())) return Voting.Status.voting;
        if (req.judgingStart() != null && !today.isBefore(req.judgingStart())) return Voting.Status.judging;
        if (req.votingEnd() != null && today.isAfter(req.votingEnd())) return Voting.Status.ended;
        if (req.nominationStart() != null && !today.isBefore(req.nominationStart())) return Voting.Status.collecting;
        return Voting.Status.draft;
    }
}
