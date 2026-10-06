import api from './client';

export const nominationsApi = {
  create: (data) => api.post('/nominations', data),
  update: (id, data) => api.put(`/nominations/${id}`, data),
  submit: (id) => api.post(`/nominations/${id}/submit`),
  delete: (id) => api.delete(`/nominations/${id}`),
  mine: () => api.get('/nominations/mine'),
  listAll: () => api.get('/nominations/mine'),
  getById: (id) => api.get(`/nominations/${id}`),

  /* Organizer review */
  forCategory: (categoryId) => api.get(`/nominations/category/${categoryId}/all`),
  approvedForCategory: (categoryId) => api.get(`/nominations/category/${categoryId}`),
  moveToReview: (id) => api.post(`/nominations/${id}/review`),
  approve: (id) => api.post(`/nominations/${id}/approve`),
  reject: (id, rejectionReason) => api.post(`/nominations/${id}/reject`, { rejectionReason }),
};

/* ------------------------------------------------------------------
 * Enum mirrors — MUST stay in sync with com.awardhub.common.enums.NominationStatus
 * ------------------------------------------------------------------ */
export const NOMINATION_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

export const NOMINATION_STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/**
 * Valid state transitions allowed by backend NominationService:
 * - Nominee: DRAFT -> SUBMITTED (via submit endpoint)
 * - Organizer: SUBMITTED -> UNDER_REVIEW, APPROVED, REJECTED
 * - Organizer: UNDER_REVIEW -> APPROVED, REJECTED
 */
export const NOMINATION_ORGANIZER_TRANSITIONS = {
  SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  DRAFT: [],
  APPROVED: [],
  REJECTED: [],
};

export default nominationsApi;

