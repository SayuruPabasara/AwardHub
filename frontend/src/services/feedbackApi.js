import apiClient from './apiClient';

export const feedbackApi = {
  // GET /api/feedback
  getAll: async () => {
    const res = await apiClient.get('/feedback');
    return res.data?.data || [];
  },

  // GET /api/feedback/user/{userId}
  getByUser: async (userId) => {
    const res = await apiClient.get(`/feedback/user/${userId}`);
    return res.data?.data || [];
  },

  // GET /api/feedback/status/{status}
  getByStatus: async (status) => {
    const res = await apiClient.get(`/feedback/status/${status}`);
    return res.data?.data || [];
  },

  // POST /api/feedback
  // dto: { userId, subject, message, feedbackType, rating, categoryId }
  submit: async (dto) => {
    const res = await apiClient.post('/feedback', dto);
    return res.data?.data;
  },

  // PUT /api/feedback/{id}/status?status={status}
  updateStatus: async (id, status) => {
    const res = await apiClient.put(`/feedback/${id}/status?status=${status}`);
    return res.data?.data;
  },

  // GET /api/feedback/{feedbackId}/replies
  getReplies: async (feedbackId) => {
    const res = await apiClient.get(`/feedback/${feedbackId}/replies`);
    return res.data?.data || [];
  },

  // POST /api/feedback/{feedbackId}/replies
  // dto: { userId, message }
  addReply: async (feedbackId, dto) => {
    const res = await apiClient.post(`/feedback/${feedbackId}/replies`, dto);
    return res.data?.data;
  },

  // DELETE /api/feedback/{id}
  delete: async (id) => {
    const res = await apiClient.delete(`/feedback/${id}`);
    return res.data?.data;
  }
};

export default feedbackApi;
