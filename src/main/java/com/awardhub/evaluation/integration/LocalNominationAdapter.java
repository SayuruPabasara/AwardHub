package com.awardhub.evaluation.integration;

import com.awardhub.evaluation.model.NominationRef;
import com.awardhub.evaluation.repository.NominationRefRepository;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/** Development adapter backed by the nomination_ref placeholder table. */
@Component
public class LocalNominationAdapter implements NominationPort {

    private final NominationRefRepository repository;

    public LocalNominationAdapter(NominationRefRepository repository) {
        this.repository = repository;
    }

    @Override
    public Map<Long, String> approvedNominations(Long categoryId) {
        Map<Long, String> out = new LinkedHashMap<>();
        for (NominationRef n : repository.findByCategoryIdAndStatus(categoryId, "APPROVED")) {
            out.put(n.getId(), n.getNomineeName());
        }
        return out;
    }
}
