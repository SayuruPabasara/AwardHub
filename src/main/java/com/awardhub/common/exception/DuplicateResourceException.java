package com.awardhub.common.exception;

/**
 * Thrown when a create/update would violate a uniqueness rule
 * (e.g. a category name that already exists for an award event,
 * an email or NIC that is already registered).
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
