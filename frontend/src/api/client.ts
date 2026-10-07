// ── Typed fetch client for the Spring Boot API ────────────────────────────

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8080'

const TOKEN_KEY = 'awardhub_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })

  if (res.status === 204) return undefined as T

  let body: any = null
  try {
    body = await res.json()
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`)
  }
  return body as T
}

function get<T>(path: string) { return request<T>(path) }
function post<T>(path: string, body?: unknown) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })
}
function put<T>(path: string, body?: unknown) {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) })
}
function del<T>(path: string) { return request<T>(path, { method: 'DELETE' }) }

// ── API surface ────────────────────────────────────────────────────────────

export const api = {
  // auth
  register: (data: { name: string; email: string; password: string; nic: string }) =>
    post<{ token: string; user: import('../types').User }>('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    post<{ token: string; user: import('../types').User }>('/api/auth/login', data),
  me: () => get<import('../types').User>('/api/auth/me'),
  updateProfile: (data: Partial<import('../types').User>) =>
    put<import('../types').User>('/api/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    put<{ message: string }>('/api/auth/password', data),
  deleteAccount: () => del<{ message: string }>('/api/auth/me'),

  // votings (public)
  votings: () => get<import('../types').Voting[]>('/api/votings'),
  voting: (id: number) => get<import('../types').Voting>(`/api/votings/${id}`),
  nominees: (votingId: number) => get<import('../types').Nomination[]>(`/api/votings/${votingId}/nominees`),
  stats: () => get<import('../types').Stats>('/api/stats'),
  winners: () => get<import('../types').Winner[]>('/api/winners'),

  // votings (admin)
  createVoting: (data: Record<string, unknown>) => post<import('../types').Voting>('/api/votings', data),
  updateVoting: (id: number, data: Record<string, unknown>) => put<import('../types').Voting>(`/api/votings/${id}`, data),
  deleteVoting: (id: number) => del<void>(`/api/votings/${id}`),

  // nominations
  myNominations: () => get<import('../types').Nomination[]>('/api/my/nominations'),
  submitNomination: (votingId: number, data: { nomineeName: string; statement: string; bio: string; evidence: string; portfolio?: string }) =>
    post<import('../types').Nomination>(`/api/votings/${votingId}/nominations`, data),
  updateNomination: (id: number, data: { statement?: string; bio?: string; evidence?: string; portfolio?: string }) =>
    put<import('../types').Nomination>(`/api/nominations/${id}`, data),
  withdrawNomination: (id: number) => del<void>(`/api/nominations/${id}`),
  reviewNomination: (id: number, data: { status: 'approved' | 'rejected'; reason?: string }) =>
    put<import('../types').Nomination>(`/api/nominations/${id}/review`, data),
  adminNominations: (votingId?: number) =>
    get<import('../types').Nomination[]>(`/api/admin/nominations${votingId ? `?votingId=${votingId}` : ''}`),

  // votes
  myVotes: () => get<import('../types').Vote[]>('/api/my/votes'),
  castVote: (votingId: number, data: { nic: string; nominationId: number }) =>
    post<import('../types').Vote>(`/api/votings/${votingId}/votes`, data),
  changeVote: (votingId: number, data: { nic: string; nominationId: number }) =>
    put<import('../types').Vote>(`/api/votings/${votingId}/votes`, data),
  withdrawVote: (votingId: number) => del<{ message: string }>(`/api/votings/${votingId}/votes`),

  // judging
  judgeAssignments: () => get<import('../types').JudgeAssignmentInfo[]>('/api/judge/assignments'),
  judgeNominees: () => get<import('../types').JudgeNominee[]>('/api/judge/nominees'),
  rubric: (votingId: number) => get<import('../types').RubricCriterion[]>(`/api/judge/rubric/${votingId}`),
  getEvaluation: (nominationId: number) => get<import('../types').Evaluation>(`/api/evaluations/${nominationId}`),
  saveEvaluation: (nominationId: number, data: { scores: { criterionId: number; score: number; comment?: string }[]; comments: string; privateNotes: string; noConflict: boolean; submit: boolean }) =>
    put<import('../types').Evaluation>(`/api/evaluations/${nominationId}`, data),
  revealIdentity: (nominationId: number) =>
    post<{ identity: string }>(`/api/evaluations/${nominationId}/reveal`),

  // feedback
  submitFeedback: (data: { votingId: number | null; rating: number; comment: string }) =>
    post<import('../types').FeedbackEntry>('/api/feedback', data),

  // admin
  adminUsers: () => get<import('../types').AdminUser[]>('/api/admin/users'),
  adminCreateUser: (data: { name: string; email: string; password: string; nic: string; role: string }) =>
    post<import('../types').AdminUser>('/api/admin/users', data),
  adminSetUserStatus: (id: number, status: string) => put<{ message: string }>(`/api/admin/users/${id}/status`, { status }),
  adminSetUserRole: (id: number, role: string) => put<{ message: string }>(`/api/admin/users/${id}/role`, { role }),
  adminDeleteUser: (id: number) => del<{ message: string }>(`/api/admin/users/${id}`),
  adminBans: () => get<import('../types').BanRecord[]>('/api/admin/bans'),
  adminBanUser: (id: number, data: { type: string; duration?: string; reason: string }) =>
    post<import('../types').BanRecord>(`/api/admin/users/${id}/ban`, data),
  adminLiftBan: (banId: number) => post<{ message: string }>(`/api/admin/bans/${banId}/lift`),
  adminSuspicious: () => get<import('../types').SuspiciousEntry[]>('/api/admin/suspicious'),
  adminResolveSuspicious: (id: number, resolved: boolean) =>
    put<{ message: string }>(`/api/admin/suspicious/${id}/resolve`, { resolved }),
  adminJudges: (votingId?: number) =>
    get<import('../types').JudgeAssignmentRecord[]>(`/api/admin/judges${votingId ? `?votingId=${votingId}` : ''}`),
  adminAssignJudge: (data: { email: string; name: string; votingId: number }) =>
    post<import('../types').JudgeAssignmentRecord>('/api/admin/judges', data),
  adminRemoveJudge: (id: number) => del<{ message: string }>(`/api/admin/judges/${id}`),
  adminAudit: () => get<import('../types').AuditEntry[]>('/api/admin/audit'),
  adminFeedback: () => get<import('../types').FeedbackEntry[]>('/api/admin/feedback'),

  // admin organizers
  adminHeadOrganizers: () => get<import('../types').HeadOrganizerSummary[]>('/api/admin/organizers'),
  adminHeadOrganizerDetail: (id: number) => get<import('../types').HeadOrganizerDetail>(`/api/admin/organizers/${id}`),
  adminInviteHeadOrganizer: (data: { email: string; votingId: number }) =>
    post<import('../types').ContestInvitation>('/api/admin/organizers/invite', data),
  adminAssignHeadOrganizer: (data: { userId: number; votingId: number }) =>
    post<{ message: string }>('/api/admin/organizers/assign', data),
  adminUnassignHeadOrganizer: (votingId: number) =>
    post<{ message: string }>(`/api/admin/organizers/unassign/${votingId}`),
  adminInvitations: (votingId?: number) =>
    get<import('../types').ContestInvitation[]>(`/api/admin/organizers/invitations${votingId ? `?votingId=${votingId}` : ''}`),
  adminRevokeInvitation: (id: number) =>
    post<{ message: string }>(`/api/admin/organizers/invitations/${id}/revoke`),

  // head organizer dashboard (scoped)
  headOrganizerOverview: () => get<import('../types').ScopedOverview>('/api/head-organizer/overview'),
  headOrganizerUpdateStatus: (votingId: number, status: string) =>
    put<import('../types').Voting>(`/api/head-organizer/contest/${votingId}/status`, { status }),
  headOrganizerJudges: () => get<import('../types').JudgeAssignmentRecord[]>('/api/head-organizer/judges'),
  headOrganizerAssignJudge: (data: { email: string; name: string; votingId: number }) =>
    post<import('../types').JudgeAssignmentRecord>('/api/head-organizer/judges', data),
  headOrganizerRemoveJudge: (id: number) => del<{ message: string }>(`/api/head-organizer/judges/${id}`),
  headOrganizerTeam: () => get<import('../types').OrganizingTeamMember[]>('/api/head-organizer/team'),
  headOrganizerInviteTeam: (data: { email: string }) =>
    post<import('../types').ContestInvitation>('/api/head-organizer/team/invite', data),
  headOrganizerRemoveTeam: (id: number) => del<{ message: string }>(`/api/head-organizer/team/${id}`),
  headOrganizerSecurity: () => get<import('../types').SuspiciousEntry[]>('/api/head-organizer/security'),
  headOrganizerEscalateSecurity: (data: { suspiciousId?: number; reason: string; severity?: string }) =>
    post<{ message: string }>('/api/head-organizer/security/escalate', data),
  headOrganizerAudit: () => get<import('../types').AuditEntry[]>('/api/head-organizer/audit'),
  headOrganizerFeedback: () => get<import('../types').FeedbackEntry[]>('/api/head-organizer/feedback'),

  // organizing team dashboard (scoped)
  teamOverview: () => get<import('../types').ScopedOverview>('/api/organizing-team/overview'),
  teamNominees: (status?: string) =>
    get<import('../types').Nomination[]>(`/api/organizing-team/nominees${status ? `?status=${status}` : ''}`),
  teamReviewNominee: (id: number, data: { status: 'approved' | 'rejected'; reason?: string; internalNotes?: string; escalateToHead?: boolean }) =>
    put<import('../types').Nomination>(`/api/organizing-team/nominees/${id}/review`, data),
  teamSecurity: () => get<import('../types').SuspiciousEntry[]>('/api/organizing-team/security'),

  // invitations
  lookupInvite: (token: string) => get<import('../types').InviteLookup>(`/api/invitations/${token}`),
  acceptInvite: (token: string, data?: { password?: string; name?: string; nic?: string }) =>
    post<{ token: string; user: import('../types').User }>(`/api/invitations/${token}/accept`, data),

  // it coordinator
  itAccounts: () => get<import('../types').AdminUser[]>('/api/itcoordinator/accounts'),
  itCreateAccount: (data: { name: string; email: string; password: string; nic: string; role: string }) =>
    post<import('../types').AdminUser>('/api/itcoordinator/accounts', data),
  itResetPassword: (id: number) => post<{ message: string }>(`/api/itcoordinator/accounts/${id}/reset-password`),
  itDeactivate: (id: number) => post<{ message: string }>(`/api/itcoordinator/accounts/${id}/deactivate`),

  // audit officer
  auditLog: () => get<import('../types').AuditEntry[]>('/api/audit/log'),
  auditSuspicious: () => get<import('../types').SuspiciousEntry[]>('/api/audit/suspicious'),
}
