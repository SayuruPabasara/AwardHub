import api from './client';

export const votesApi = {
  cast: (categoryId, data) => api.post(`/categories/${categoryId}/votes`, data),
  withdraw: (categoryId) => api.delete(`/categories/${categoryId}/votes`),
  mine: () => api.get('/my/votes'),
};
