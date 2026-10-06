package com.awardhub.common.exception;

/**
 * Thrown when a lifecycle status change is not legal from the entity's
 * current state (e.g. archiving a category while voting is open).
 */
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
