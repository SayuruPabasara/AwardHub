import apiClient from './apiClient';

export const reportsApi = {
  // GET /api/reports
  getAll: async () => {
    const res = await apiClient.get('/reports');
    return res.data?.data || [];
  },

  // GET /api/reports/type/{type}
  getByType: async (type) => {
    const res = await apiClient.get(`/reports/type/${type}`);
    return res.data?.data || [];
  },

  // GET /api/reports/role/{role}
  getForRole: async (role) => {
    const res = await apiClient.get(`/reports/role/${role.toUpperCase()}`);
    return res.data?.data || [];
  },

  // POST /api/reports
  // dto: { reportType, categoryId, content, generatedBy, format }
  generate: async (dto) => {
    const res = await apiClient.post('/reports', dto);
    return res.data?.data;
  },

  // PUT /api/reports/{id}/archive
  archive: async (id) => {
    const res = await apiClient.put(`/reports/${id}/archive`);
    return res.data?.data;
  },

  // DELETE /api/reports/{id}
  delete: async (id) => {
    const res = await apiClient.delete(`/reports/${id}`);
    return res.data?.data;
  }
};

export default reportsApi;
