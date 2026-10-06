package com.awardhub.evaluation.integration;

import com.awardhub.common.enums.NominationStatus;
import com.awardhub.nomination.entity.Nomination;
import com.awardhub.nomination.repository.NominationRepository;
import com.awardhub.user.entity.User;
import com.awardhub.user.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * INTEGRATION FIX: replaces LocalNominationAdapter, which read from the
 * nomination_ref placeholder table (deleted along with NominationRef /
 * NominationRefRepository — nothing else referenced them). This reads the
 * real, now-workflowed nomination module: only nominations that made it to
 * APPROVED are visible to evaluation, matching what VoteService/VoteController
 * already require for casting a vote.
 */
@Component
public class RealNominationAdapter implements NominationPort {

    private final NominationRepository nominations;
    private final UserRepository users;

    public RealNominationAdapter(NominationRepository nominations, UserRepository users) {
        this.nominations = nominations;
        this.users = users;
    }

    @Override
    public Map<Long, String> approvedNominations(Long categoryId) {
        Map<Long, String> out = new LinkedHashMap<>();
        for (Nomination n : nominations.findByCategoryIdAndStatus(categoryId, NominationStatus.APPROVED)) {
            String name = users.findById(n.getNomineeId()).map(User::getFullName).orElse("Nominee #" + n.getNomineeId());
            out.put(n.getId(), name);
        }
        return out;
    }
}
