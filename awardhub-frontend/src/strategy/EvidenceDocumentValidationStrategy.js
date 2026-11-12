import { DocumentValidationStrategy } from './DocumentValidationStrategy';
import { NomineeDocumentType } from './NomineeDocumentType';

/** Concrete strategy: certificates and achievement proofs (scans or photos, max 10MB). */
export class EvidenceDocumentValidationStrategy extends DocumentValidationStrategy {
  constructor() {
    super({
      supportedTypes: [NomineeDocumentType.CERTIFICATE, NomineeDocumentType.ACHIEVEMENT_PROOF],
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeBytes: 10 * 1024 * 1024,
      description: 'Certificate/achievement proof',
      label: 'Certificate / Achievement Proof',
    });
  }
}
