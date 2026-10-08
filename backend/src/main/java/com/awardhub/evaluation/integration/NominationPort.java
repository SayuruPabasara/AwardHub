package com.awardhub.evaluation.integration;

import java.util.Map;

/**
 * The only thing Module 5 asks of Nomination Management: the approved nominations in a
 * category, as nominationId -> nominee display name.
 *
 * Keeping this as an interface means the merge with Tharuneth's module is a one-class change,
 * not a rewrite of the services.
 */
public interface NominationPort {
    Map<Long, String> approvedNominations(Long categoryId);
}
