import { DocumentValidationStrategy } from './DocumentValidationStrategy';
import { NomineeDocumentType } from './NomineeDocumentType';

/** Concrete strategy: NIC / passport copy (scan or photo, max 5MB). */
export class IdentityDocumentValidationStrategy extends DocumentValidationStrategy {
  constructor() {
    super({
      supportedTypes: [NomineeDocumentType.NIC_PASSPORT_COPY],
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeBytes: 5 * 1024 * 1024,
      description: 'NIC/Passport copy',
      label: 'NIC / Passport Copy',
    });
  }
}
