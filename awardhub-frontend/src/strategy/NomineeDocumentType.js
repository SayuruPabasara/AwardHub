/**
 * Nominee Document Types matching backend enum NomineeDocumentType.java
 */
export const NomineeDocumentType = Object.freeze({
  NIC_PASSPORT_COPY: 'NIC_PASSPORT_COPY',
  CV: 'CV',
  CERTIFICATE: 'CERTIFICATE',
  ACHIEVEMENT_PROOF: 'ACHIEVEMENT_PROOF',
  PROFILE_PHOTO: 'PROFILE_PHOTO',
  OTHER: 'OTHER',
});

export const NOMINEE_DOCUMENT_LABELS = {
  [NomineeDocumentType.NIC_PASSPORT_COPY]: 'NIC / Passport Copy',
  [NomineeDocumentType.CV]: 'Curriculum Vitae (CV)',
  [NomineeDocumentType.CERTIFICATE]: 'Certificate',
  [NomineeDocumentType.ACHIEVEMENT_PROOF]: 'Achievement Proof',
  [NomineeDocumentType.PROFILE_PHOTO]: 'Profile Photo',
  [NomineeDocumentType.OTHER]: 'Other Supporting Document',
};

export const NOMINEE_DOCUMENT_OPTIONS = [
  { value: NomineeDocumentType.NIC_PASSPORT_COPY, label: 'NIC / Passport Copy' },
  { value: NomineeDocumentType.CV, label: 'Curriculum Vitae (CV)' },
  { value: NomineeDocumentType.CERTIFICATE, label: 'Certificate' },
  { value: NomineeDocumentType.ACHIEVEMENT_PROOF, label: 'Achievement Proof' },
  { value: NomineeDocumentType.PROFILE_PHOTO, label: 'Profile Photo' },
  { value: NomineeDocumentType.OTHER, label: 'Other Supporting Document' },
];
