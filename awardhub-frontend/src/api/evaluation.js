import api from './client';

export const evaluationApi = {
  worklist: (judgeId) => api.get(`/evaluation/judges/${judgeId}/worklist`),
  getOne: (nominationId, judgeId) => api.get(`/evaluation/nominations/${nominationId}/judges/${judgeId}`),
  saveOne: (nominationId, judgeId, data) =>
    api.post(`/evaluation/nominations/${nominationId}/judges/${judgeId}`, data).catch(() => data),
  saveOrSubmit: (categoryId, data) => api.post(`/evaluation/categories/${categoryId}/evaluations`, data),
  submitted: (categoryId) => api.get(`/evaluation/categories/${categoryId}/evaluations`),
  verify: (id, actorId) => api.patch(`/evaluation/evaluations/${id}/verify?actorId=${actorId}`),
  reopen: (id, reason, actorId) => api.patch(`/evaluation/evaluations/${id}/reopen?actorId=${actorId}`, { reason }),

  /* Results */
  progress: (categoryId) => api.get(`/evaluation/results/${categoryId}/progress`),
  latestResults: (categoryId) => api.get(`/evaluation/results/${categoryId}`),
  publishedResults: (categoryId) => api.get(`/evaluation/results/${categoryId}/published`),
  publicResults: (categoryId) =>
    api.get(`/evaluation/results/${categoryId}/published`).catch(() => api.get(`/evaluation/results/${categoryId}`)),
  categoryRankings: (categoryId) => api.get(`/evaluation/results/${categoryId}`),
  calculate: (categoryId, actorId) => api.post(`/evaluation/results/${categoryId}/calculate?actorId=${actorId}`),
  submitForApproval: (categoryId, actorId) => api.post(`/evaluation/results/${categoryId}/submit-for-approval?actorId=${actorId}`),
  publish: (categoryId, data) => api.post(`/evaluation/results/${categoryId}/publish`, data),
  reopenResults: (categoryId, reason, actorId) => api.post(`/evaluation/results/${categoryId}/reopen?actorId=${actorId}`, { reason }),
  resolveTie: (categoryId, data) => api.post(`/evaluation/results/${categoryId}/resolve-tie`, data),
  auditTrail: () => api.get('/evaluation/results/audit/recent'),

  /* Assignments */
  assignmentsByCategory: (categoryId) => api.get(`/evaluation/assignments/category/${categoryId}`),
  assignmentsByJudge: (judgeId) => api.get(`/evaluation/assignments/judge/${judgeId}`),
  assign: (data, actorId) => api.post(`/evaluation/assignments?actorId=${actorId}`, data),
  revoke: (id, reason, actorId) => api.patch(`/evaluation/assignments/${id}/revoke?actorId=${actorId}`, { reason }),

  /* Rubrics */
  activeRubric: (categoryId) => api.get(`/evaluation/rubrics/${categoryId}/active`),
  rubricHistory: (categoryId) => api.get(`/evaluation/rubrics/${categoryId}/history`),
  publishRubric: (rubric, actorId) => api.post(`/evaluation/rubrics?actorId=${actorId}`, rubric),

  /* Schemes */
  allSchemes: () => api.get('/evaluation/schemes'),
  schemeByCategory: (categoryId) => api.get(`/evaluation/schemes/${categoryId}`),
  saveScheme: (scheme) => api.post('/evaluation/schemes', scheme),
  lockScheme: (categoryId, actorId) => api.patch(`/evaluation/schemes/${categoryId}/lock?actorId=${actorId}`),
};

export default evaluationApi;
