import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};
