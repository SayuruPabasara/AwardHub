package com.awardhub.evaluation.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String what, Long id) {
        super(what + " " + id + " was not found.");
    }
    public ResourceNotFoundException(String message) { super(message); }
}
