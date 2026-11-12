import { DocumentValidationStrategy } from './DocumentValidationStrategy';
import { NomineeDocumentType } from './NomineeDocumentType';

/** Concrete strategy: profile photo (images only, max 2MB). */
export class ProfilePhotoValidationStrategy extends DocumentValidationStrategy {
  constructor() {
    super({
      supportedTypes: [NomineeDocumentType.PROFILE_PHOTO],
      allowedExtensions: ['jpg', 'jpeg', 'png'],
      maxSizeBytes: 2 * 1024 * 1024,
      description: 'Profile photo',
      label: 'Profile Photo',
    });
  }
}
