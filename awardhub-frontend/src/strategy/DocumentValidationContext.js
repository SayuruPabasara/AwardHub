import { NomineeDocumentType } from './NomineeDocumentType';
import { CvValidationStrategy } from './CvValidationStrategy';
import { EvidenceDocumentValidationStrategy } from './EvidenceDocumentValidationStrategy';
import { IdentityDocumentValidationStrategy } from './IdentityDocumentValidationStrategy';
import { ProfilePhotoValidationStrategy } from './ProfilePhotoValidationStrategy';
import { GeneralDocumentValidationStrategy } from './GeneralDocumentValidationStrategy';

/**
 * STRATEGY PATTERN - Context.
 *
 * Holds the available validation strategies and delegates validation to the strategy
 * that matches the document type.
 *
 * Adding a new document type only requires registering a new strategy (Open/Closed Principle).
 */
export class DocumentValidationContext {
  constructor(strategies = []) {
    this.strategies = new Map();
    strategies.forEach((strategy) => this.registerStrategy(strategy));
  }

  registerStrategy(strategy) {
    for (const type of strategy.supportedTypesList()) {
      this.strategies.set(type, strategy);
    }
  }

  getStrategy(documentType) {
    const strategy = this.strategies.get(documentType);
    if (!strategy) {
      throw new Error(`No validation strategy registered for document type: ${documentType}`);
    }
    return strategy;
  }

  /**
   * Validate file against the strategy registered for the given documentType.
   * @param {string} documentType
   * @param {File} file
   * @returns {{ valid: boolean, error?: string }}
   */
  validate(documentType, file) {
    if (!documentType) {
      return { valid: false, error: 'Document type is required' };
    }
    const strategy = this.getStrategy(documentType);
    return strategy.validate(file);
  }
}

/**
 * Default pre-configured DocumentValidationContext with all standard strategies.
 */
export const documentValidationContext = new DocumentValidationContext([
  new IdentityDocumentValidationStrategy(),
  new CvValidationStrategy(),
  new EvidenceDocumentValidationStrategy(),
  new ProfilePhotoValidationStrategy(),
  new GeneralDocumentValidationStrategy(),
]);
