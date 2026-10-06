import { API_BASE } from '../utils/constants';

class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken() {
  return localStorage.getItem('awardhub_token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  /* Handle 204 No Content */
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new ApiError(response.status, message, data);
  }

  return data;
}

export const api = {
  get: (url) => apiRequest(url),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => apiRequest(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
  upload: (url, formData) => apiRequest(url, { method: 'POST', body: formData }),
};

export { ApiError };
export default api;
