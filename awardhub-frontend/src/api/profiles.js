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
  downloadDocument: async (documentId, fileName) => {
    const token = localStorage.getItem('awardhub_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`/api/profile/nominee/me/documents/${documentId}/download`, { headers });
    if (!res.ok) throw new Error('Failed to download document');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
};

export default profilesApi;
