package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Concrete strategy: any other supporting document (most lenient rules). */
@Component
public class GeneralDocumentValidationStrategy extends AbstractDocumentValidationStrategy {

    public GeneralDocumentValidationStrategy() {
        super(Set.of(NomineeDocumentType.OTHER),
                Set.of("pdf", "doc", "docx", "jpg", "jpeg", "png"),
                10L * 1024 * 1024,
                "Document");
    }
}
