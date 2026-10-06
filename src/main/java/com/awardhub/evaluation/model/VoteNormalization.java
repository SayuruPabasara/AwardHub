package com.awardhub.evaluation.model;

/** How a raw vote count becomes a comparable 0-100 score inside one category. */
public enum VoteNormalization {
    /** Leader gets 100, everyone else is a proportion of the leader. */
    MAX_IN_CATEGORY,
    /** Nominee's share of all votes cast in the category, scaled to 100. */
    SHARE_OF_TOTAL
}
