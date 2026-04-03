import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
api.interceptors.response.use(
  (response) => {
    // Show success for mutations if a success message exists
    if (response.config?.method !== 'get' && response.data?.message && !response.config?.url?.includes('progress/quiz/start')) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Use custom event or state logic to redirect
      window.dispatchEvent(new Event('auth-unauthorized'));
      toast.error('Session expired. Please log in again.');
    } else if (error.response?.status === 503) {
      // Trigger global lockdown state
      window.dispatchEvent(new Event('system-maintenance'));
    } else if (error.response?.data) {
      const msg = error.response.data.message || error.response.data.error || 'An error occurred';
      toast.error(msg);
    } else {
      toast.error(error.message || 'Network error');
    }
    return Promise.reject(error);
  }
);

export default api;
