import apiClient from './apiClient';

export const analyticsApi = {
  // GET /api/analytics
  getAll: async () => {
    const res = await apiClient.get('/analytics');
    return res.data?.data || [];
  },

  // GET /api/analytics/metric/{metricName}
  getByMetric: async (metricName) => {
    const res = await apiClient.get(`/analytics/metric/${encodeURIComponent(metricName)}`);
    return res.data?.data || [];
  },

  // GET /api/analytics/category/{categoryId}
  getByCategory: async (categoryId) => {
    const res = await apiClient.get(`/analytics/category/${categoryId}`);
    return res.data?.data || [];
  },

  // POST /api/analytics
  // snapshot: { metricName, metricValue, categoryId }
  record: async (snapshot) => {
    const res = await apiClient.post('/analytics', snapshot);
    return res.data?.data;
  },

  // DELETE /api/analytics/{id}
  delete: async (id) => {
    const res = await apiClient.delete(`/analytics/${id}`);
    return res.data?.data;
  }
};

export default analyticsApi;
