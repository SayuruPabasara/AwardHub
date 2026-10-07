package com.awardhub.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public static class ApiException extends RuntimeException {
        private final HttpStatus status;
        public ApiException(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }
        public HttpStatus getStatus() { return status; }
    }

    public static class NotFoundException extends ApiException {
        public NotFoundException(String message) { super(HttpStatus.NOT_FOUND, message); }
    }

    public static class BadRequestException extends ApiException {
        public BadRequestException(String message) { super(HttpStatus.BAD_REQUEST, message); }
    }

    public static class ForbiddenException extends ApiException {
        public ForbiddenException(String message) { super(HttpStatus.FORBIDDEN, message); }
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConflict(org.springframework.dao.DataIntegrityViolationException ex) {
        // DB backstop for one-organizer-one-contest (uq_votings_head_organizer) and similar races.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "This assignment conflicts with an existing one (e.g. the organizer already serves another contest)."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error: " + ex.getMessage()));
    }
}
