import { DocumentValidationStrategy } from './DocumentValidationStrategy';
import { NomineeDocumentType } from './NomineeDocumentType';

/** Concrete strategy: any other supporting document (most lenient rules, max 10MB). */
export class GeneralDocumentValidationStrategy extends DocumentValidationStrategy {
  constructor() {
    super({
      supportedTypes: [NomineeDocumentType.OTHER],
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      maxSizeBytes: 10 * 1024 * 1024,
      description: 'Document',
      label: 'Other Supporting Document',
    });
  }
}
