package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Concrete strategy: CV / resume (text documents only, no images). */
@Component
public class CvValidationStrategy extends AbstractDocumentValidationStrategy {

    public CvValidationStrategy() {
        super(Set.of(NomineeDocumentType.CV),
                Set.of("pdf", "doc", "docx"),
                5L * 1024 * 1024,
                "CV");
    }
}
