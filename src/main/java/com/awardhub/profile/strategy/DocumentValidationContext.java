package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;


//STRATEGY PATTERN - Context
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
