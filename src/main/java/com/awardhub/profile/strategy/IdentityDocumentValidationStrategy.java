package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Concrete strategy: NIC / passport copy (scan or photo, small size). */
@Component
public class IdentityDocumentValidationStrategy extends AbstractDocumentValidationStrategy {

    public IdentityDocumentValidationStrategy() {
        super(Set.of(NomineeDocumentType.NIC_PASSPORT_COPY),
                Set.of("pdf", "jpg", "jpeg", "png"),
                5L * 1024 * 1024,
                "NIC/Passport copy");
    }
}
