package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * STRATEGY PATTERN - Context.
 *
 * Holds the available validation strategies and delegates to the one that
 * matches the document type. It never contains any validation rules itself.
 *
 * Note: the lecture's Context stores one strategy and exposes setStrategy().
 * Spring services are singletons shared by concurrent requests, so a mutable
 * "current strategy" field would be a race condition (two uploads at the same
 * time could overwrite each other's strategy). Instead, the strategy is
 * selected per call from an immutable map - same pattern, thread-safe.
 *
 * Adding a new document type later only needs a new strategy class; this
 * context and NomineeDocumentService stay unchanged (Open/Closed Principle).
 */
@Component
public class DocumentValidationContext {

    private final Map<NomineeDocumentType, DocumentValidationStrategy> strategies =
            new EnumMap<>(NomineeDocumentType.class);

    // Spring injects every DocumentValidationStrategy bean found in the application.
    public DocumentValidationContext(List<DocumentValidationStrategy> availableStrategies) {
        for (DocumentValidationStrategy strategy : availableStrategies) {
            for (NomineeDocumentType type : strategy.supportedTypes()) {
                if (strategies.putIfAbsent(type, strategy) != null) {
                    throw new IllegalStateException("More than one validation strategy registered for " + type);
                }
            }
        }
        // Fail fast at startup if a document type was added without a strategy.
        for (NomineeDocumentType type : NomineeDocumentType.values()) {
            if (!strategies.containsKey(type)) {
                throw new IllegalStateException("No validation strategy registered for " + type);
            }
        }
    }

    public void validate(NomineeDocumentType documentType, MultipartFile file) {
        strategies.get(documentType).validate(file);
    }
}
