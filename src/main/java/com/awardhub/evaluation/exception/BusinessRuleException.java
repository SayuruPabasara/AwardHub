package com.awardhub.evaluation.exception;

/** Thrown when a request is well-formed but breaks an award rule (e.g. scoring after the deadline). */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) { super(message); }
}
