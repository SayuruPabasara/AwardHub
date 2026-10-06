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

export default nominationsApi;
