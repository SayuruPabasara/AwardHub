package com.awardhub.common.exception;

/**
 * Thrown for a well-formed request that fails a business validation rule
 * (as opposed to a Bean Validation annotation failure, which throws
 * MethodArgumentNotValidException and is handled separately).
 *
 * This class did not exist anywhere in the codebase even though
 * CategoryService, the rewritten AuthService, and others throw it —
 * added as part of consolidating the vote module's auth code onto the
 * shared exception set.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
