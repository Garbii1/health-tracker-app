// Remove AxiosError import if only using isAxiosError
import axios, { InternalAxiosRequestConfig } from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers['Authorization'] = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for error handling (e.g., redirect on 401)
apiClient.interceptors.response.use(
  response => response,
  (error) => {
    // Check if it's an Axios error first
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        if (typeof window !== 'undefined') {
            console.error("Unauthorized access - 401. Clearing token.");
            localStorage.removeItem('authToken');
            // Consider triggering logout via context/state instead of direct redirect
            // window.location.href = '/login';
        }
      }
    } else {
        console.error("Non-Axios error in response interceptor:", error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;