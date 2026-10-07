package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Concrete strategy: certificates and achievement proofs (scans or photos, larger size allowed). */
@Component
public class EvidenceDocumentValidationStrategy extends AbstractDocumentValidationStrategy {

    public EvidenceDocumentValidationStrategy() {
        super(Set.of(NomineeDocumentType.CERTIFICATE, NomineeDocumentType.ACHIEVEMENT_PROOF),
                Set.of("pdf", "jpg", "jpeg", "png"),
                10L * 1024 * 1024,
                "Certificate/achievement proof");
    }
}
