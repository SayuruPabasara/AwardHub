package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

/**
 * STRATEGY PATTERN - Strategy interface.
 *
 * Common contract for every document-validation algorithm. Each nominee
 * document type has its own rules for allowed file formats and maximum size,
 * so each rule set lives in its own concrete strategy class.
 */
public interface DocumentValidationStrategy {

    /** The document types this strategy is responsible for validating. */
    Set<NomineeDocumentType> supportedTypes();

    /** Validates the uploaded file; throws IllegalArgumentException if it breaks the rules. */
    void validate(MultipartFile file);
}