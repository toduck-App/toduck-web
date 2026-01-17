import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API Base URL - localhost:8080 for local, https://api-toduck.seol.pro for production
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8080/v1'
  : 'https://api-toduck.seol.pro/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 (just logout, no refresh)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
