package com.awardhub.evaluation.model;

/**
 * Lifecycle of a category's result set.
 * DRAFT -> CALCULATED -> PENDING_APPROVAL -> PUBLISHED
 * A published set can be re-opened, which moves it back to CALCULATED and records the reason.
 */
public enum ResultStatus {
    DRAFT,
    CALCULATED,
    PENDING_APPROVAL,
    PUBLISHED
}
