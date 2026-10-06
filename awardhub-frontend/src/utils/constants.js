export const API_BASE = '/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  JUDGE: 'JUDGE',
  VOTER: 'VOTER',
  NOMINEE: 'NOMINEE',
  IT_COORDINATOR: 'IT_COORDINATOR',
  AUDIT: 'AUDIT',
  HEAD_ORGANIZER: 'HEAD_ORGANIZER',
  ORGANIZING_TEAM_MEMBER: 'ORGANIZING_TEAM_MEMBER',
};

export const ROLE_LABELS = {
  ADMIN: 'System Administrator',
  ORGANIZER: 'Award Organizer',
  JUDGE: 'Judge',
  VOTER: 'Voter',
  NOMINEE: 'Nominee',
  IT_COORDINATOR: 'IT Coordinator',
  AUDIT: 'Auditor',
  HEAD_ORGANIZER: 'Head Organizer',
  ORGANIZING_TEAM_MEMBER: 'Organizing Team Member',
};

export const STATUS_COLORS = {
  DRAFT: 'var(--status-neutral)',
  PENDING: 'var(--status-warning)',
  SUBMITTED: 'var(--status-info)',
  UNDER_REVIEW: 'var(--status-warning)',
  APPROVED: 'var(--status-success)',
  REJECTED: 'var(--status-error)',
  ACTIVE: 'var(--status-success)',
  INACTIVE: 'var(--status-neutral)',
  PUBLISHED: 'var(--status-success)',
  ARCHIVED: 'var(--status-neutral)',
  PENDING_VERIFICATION: 'var(--status-warning)',
  SUSPENDED: 'var(--status-error)',
};
