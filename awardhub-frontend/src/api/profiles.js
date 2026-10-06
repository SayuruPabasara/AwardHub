import api from './client';

export const profilesApi = {
  getMyProfile: () => api.get('/profile/nominee/me'),
  updateMyProfile: (data) => api.put('/profile/nominee/me', data),
  getProfileById: (id) => api.get(`/profile/nominee/${id}`),

  /* Documents */
  listDocuments: () => api.get('/profile/nominee/me/documents'),
  getMyDocuments: () => api.get('/profile/nominee/me/documents'),
  uploadDocument: (formDataOrType, maybeFile) => {
    if (formDataOrType instanceof FormData) {
      return api.upload('/profile/nominee/me/documents', formDataOrType);
    }
    const formData = new FormData();
    formData.append('documentType', formDataOrType);
    formData.append('file', maybeFile);
    return api.upload('/profile/nominee/me/documents', formData);
  },
  deleteDocument: (documentId) => api.delete(`/profile/nominee/me/documents/${documentId}`),
};

export default profilesApi;
