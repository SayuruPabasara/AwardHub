package com.awardhub.evaluation.integration;

import com.awardhub.evaluation.model.VoteTally;
import com.awardhub.evaluation.repository.VoteTallyRepository;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/** Development adapter backed by the vote_tally placeholder table. */
@Component
public class LocalVoteAdapter implements VotePort {

    private final VoteTallyRepository repository;

    public LocalVoteAdapter(VoteTallyRepository repository) {
        this.repository = repository;
    }

    @Override
    public Map<Long, Long> voteCounts(Long categoryId) {
        Map<Long, Long> out = new LinkedHashMap<>();
        for (VoteTally t : repository.findByCategoryId(categoryId)) {
            out.put(t.getNominationId(), t.getVoteCount());
        }
        return out;
    }
}
