import api from './client';

export const votesApi = {
  /** Cast a ballot for an approved nomination in a category. Requires { nic, nominationId }. */
  cast: (categoryId, data) => api.post(`/categories/${categoryId}/votes`, data),
  /** Withdraw a previously cast ballot for a category during an active voting window. */
  withdraw: (categoryId) => api.delete(`/categories/${categoryId}/votes`),
  /** Get all votes cast by the authenticated user. */
  mine: () => api.get('/my/votes'),
};
