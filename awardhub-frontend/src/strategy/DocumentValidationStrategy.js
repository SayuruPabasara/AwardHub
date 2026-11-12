/**
 * STRATEGY PATTERN - Base Strategy Interface / Abstract Strategy.
 *
 * Provides common file validation logic for allowed extensions and maximum file size,
 * matching backend AbstractDocumentValidationStrategy.
 */
export class DocumentValidationStrategy {
  /**
   * @param {Object} options
   * @param {string[]} options.supportedTypes - Array of NomineeDocumentType enum strings
   * @param {string[]} options.allowedExtensions - Lowercase extensions e.g. ['pdf', 'doc']
   * @param {number} options.maxSizeBytes - Max file size in bytes
   * @param {string} options.description - Rule description used in error messages
   * @param {string} [options.label] - Friendly display label
   */
  constructor({ supportedTypes, allowedExtensions, maxSizeBytes, description, label }) {
    this.supportedTypes = supportedTypes;
    this.allowedExtensions = allowedExtensions;
    this.maxSizeBytes = maxSizeBytes;
    this.description = description;
    this.label = label || description;
  }

  supportedTypesList() {
    return this.supportedTypes;
  }

  getAllowedExtensions() {
    return this.allowedExtensions;
  }

  getMaxSizeBytes() {
    return this.maxSizeBytes;
  }

  getMaxSizeMB() {
    return Math.round(this.maxSizeBytes / (1024 * 1024));
  }

  getAcceptAttribute() {
    return this.allowedExtensions.map((ext) => `.${ext}`).join(',');
  }

  getAllowedExtensionsFormatted() {
    return this.allowedExtensions.map((ext) => ext.toUpperCase()).join(', ');
  }

  /**
   * Validate a file against strategy rules.
   * @param {File} file
   * @returns {{ valid: boolean, error?: string }}
   */
  validate(file) {
    if (!file) {
      return { valid: false, error: 'Uploaded file is empty' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'Uploaded file is empty' };
    }

    const extension = this.getExtension(file.name);
    if (!this.allowedExtensions.includes(extension)) {
      const allowedSorted = [...this.allowedExtensions].sort().join(', ');
      return {
        valid: false,
        error: `${this.description} must be one of: ${allowedSorted}`,
      };
    }

    if (file.size > this.maxSizeBytes) {
      return {
        valid: false,
        error: `${this.description} must not exceed ${this.getMaxSizeMB()}MB`,
      };
    }

    return { valid: true };
  }

  getExtension(fileName) {
    if (!fileName) return '';
    const dot = fileName.lastIndexOf('.');
    return dot === -1 || dot === fileName.length - 1
      ? ''
      : fileName.substring(dot + 1).toLowerCase();
  }
}
