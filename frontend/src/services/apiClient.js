import axios from 'axios';

// Create configured Axios instance
// Uses relative '/api' which Vite proxies to 'http://localhost:8080/api'
// Direct fallback to 'http://localhost:8080/api' if proxy isn't used
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor to format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
