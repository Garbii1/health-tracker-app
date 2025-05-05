import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'; // Import Axios types

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to requests
// Use InternalAxiosRequestConfig for request interceptors
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => { // Add types
    // Check if running on the client side before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) { // Check if headers object exists
        config.headers['Authorization'] = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Type the error if possible, otherwise use 'any'
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for error handling (e.g., redirect on 401)
apiClient.interceptors.response.use(
  response => response, // Response type is inferred or can be AxiosResponse<any>
  (error: any) => { // Use 'any' or a more specific AxiosError type
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - e.g., clear token, redirect to login
      if (typeof window !== 'undefined') {
          console.error("Unauthorized access - 401");
          // Optional: Clear stored token
          localStorage.removeItem('authToken');
          // Optional: Redirect to login page
          // NOTE: Directly manipulating window.location can cause issues with Next.js router.
          // It's often better to handle redirects within components using useRouter.
          // Consider setting a state in AuthContext that triggers a redirect in a useEffect hook.
          // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;