import api from './client';

export const adminApi = {
  listUsers: () => api.get('/itcoordinator/accounts'),
  createUser: (data) => api.post('/itcoordinator/accounts', data),
  resetPassword: (id) => api.post(`/itcoordinator/accounts/${id}/reset-password`),
  deactivateUser: (id) => api.post(`/itcoordinator/accounts/${id}/deactivate`),
  activateUser: (id) => api.post(`/itcoordinator/accounts/${id}/activate`),
};
