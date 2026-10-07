import { DocumentValidationStrategy } from './DocumentValidationStrategy';
import { NomineeDocumentType } from './NomineeDocumentType';

/** Concrete strategy: CV / resume (text documents only, no images, max 5MB). */
export class CvValidationStrategy extends DocumentValidationStrategy {
  constructor() {
    super({
      supportedTypes: [NomineeDocumentType.CV],
      allowedExtensions: ['pdf', 'doc', 'docx'],
      maxSizeBytes: 5 * 1024 * 1024,
      description: 'CV',
      label: 'Curriculum Vitae (CV)',
    });
  }
}
