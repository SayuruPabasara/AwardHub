package com.awardhub.profile.strategy;

import com.awardhub.profile.entity.NomineeDocumentType;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Concrete strategy: profile photo (images only, smallest size limit). */
@Component
public class ProfilePhotoValidationStrategy extends AbstractDocumentValidationStrategy {

    public ProfilePhotoValidationStrategy() {
        super(Set.of(NomineeDocumentType.PROFILE_PHOTO),
                Set.of("jpg", "jpeg", "png"),
                2L * 1024 * 1024,
                "Profile photo");
    }
}
