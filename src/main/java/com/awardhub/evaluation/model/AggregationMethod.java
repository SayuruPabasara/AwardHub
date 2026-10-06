package com.awardhub.evaluation.model;

/** How several judges' scores for one nominee are combined into a single judge score. */
public enum AggregationMethod {
    /** Plain arithmetic mean of all submitted judge scores. */
    MEAN,
    /** Drops the single highest and single lowest score, then takes the mean.
     *  Falls back to MEAN when fewer than 5 judges submitted. */
    TRIMMED_MEAN,
    /** Middle value - most resistant to one extreme judge. */
    MEDIAN
}
