import api from './client';

export const reportsApi = {
  generate: (data) => api.post('/reports', data),
  getAll: () => api.get('/reports'),
  getByType: (type) => api.get(`/reports/type/${type}`),
  getForRole: (role) => api.get(`/reports/role/${role}`),
  archive: (id) => api.put(`/reports/${id}/archive`),
};

export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  getByUser: (userId) => api.get(`/feedback/user/${userId}`),
  getByStatus: (status) => api.get(`/feedback/status/${status}`),
  updateStatus: (id, status) => api.put(`/feedback/${id}/status?status=${status}`),
  addReply: (feedbackId, data) => api.post(`/feedback/${feedbackId}/replies`, data),
  getReplies: (feedbackId) => api.get(`/feedback/${feedbackId}/replies`),
};

export const analyticsApi = {
  record: (data) => api.post('/analytics', data),
  getAll: () => api.get('/analytics'),
  getByMetric: (metricName) => api.get(`/analytics/metric/${metricName}`),
  getByCategory: (categoryId) => api.get(`/analytics/category/${categoryId}`),
  delete: (id) => api.delete(`/analytics/${id}`),
};
