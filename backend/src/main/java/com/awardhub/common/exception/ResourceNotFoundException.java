package com.awardhub.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String what, Long id) {
        super(what + " " + id + " was not found.");
    }
}