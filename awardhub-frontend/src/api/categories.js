import api from './client';

export const categoriesApi = {
  /* Public & General List */
  list: (params = '') => api.get(`/categories${params ? '?' + params : ''}`),
  listPublic: (params = '') => api.get(`/categories${params ? '?' + params : ''}`),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  updateStatus: (id, status) => api.patch(`/categories/${id}/status`, { status }),
  archive: (id) => api.patch(`/categories/${id}/archive`),
  delete: (id) => api.delete(`/categories/${id}`),
  getStats: () => api.get('/categories/stats'),
  getEvents: () => api.get('/categories/events'),

  /* Nominee specific category endpoints */
  forNominee: (search = '', eventId = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (eventId) params.append('eventId', eventId);
    const qs = params.toString();
    return api.get(`/nominee/categories${qs ? '?' + qs : ''}`);
  },
  getForNominee: (id) => api.get(`/nominee/categories/${id}`),

  /* Criteria */
  getCriteria: (id) => api.get(`/categories/${id}/criteria`),
  addCriterion: (id, data) => api.post(`/categories/${id}/criteria`, data),
  updateCriterion: (id, criterionId, data) => api.put(`/categories/${id}/criteria/${criterionId}`, data),
  deleteCriterion: (id, criterionId) => api.delete(`/categories/${id}/criteria/${criterionId}`),

  /* Judge assignment */
  getJudges: (id) => api.get(`/categories/${id}/judges`),
  assignJudge: (id, judgeData) => api.post(`/categories/${id}/judges`, typeof judgeData === 'object' ? judgeData : { judgeId: judgeData }),
  removeJudge: (id, judgeId) => api.delete(`/categories/${id}/judges/${judgeId}`),
  getAvailableJudges: () => api.get('/categories/judges/available'),
};

export default categoriesApi;
