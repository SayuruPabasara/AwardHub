package com.awardhub.common.enums;

public enum NominationStatus {

    // Nomination is incomplete or saved for later editing.
    DRAFT,

    // Nomination has been submitted and is ready for organizer review.
    SUBMITTED,

    // Organizer is currently reviewing the submitted nomination.
    UNDER_REVIEW,

    // Organizer has approved the nomination.
    ACCEPTED,

    // Organizer has rejected the nomination.
    // A rejection reason will be required by the service validation.
    REJECTED
}