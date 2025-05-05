import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/router';
import axios from 'axios'; // Import axios for isAxiosError check

// Import schemas from their respective pages to infer types
import { loginSchema } from '@/pages/login'; // Ensure this is exported from login.tsx
import { registerSchema } from '@/pages/register'; // Ensure this is exported from register.tsx
import * as z from 'zod';

// --- Types Definition ---

// User type based on backend serializer/expected data
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// Inferred type for login form data
type LoginCredentials = z.infer<typeof loginSchema>;

// Inferred type for registration form data (includes password2 for validation)
type RegisterFormInputs = z.infer<typeof registerSchema>;
// Type for the actual payload sent to the registration API (excludes password2)
type RegisterApiPayload = Omit<RegisterFormInputs, 'password2'>;

// Type for the Auth Context value
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  // Use specific types for function parameters and 'unknown' for error return
  loginAction: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: unknown }>;
  registerAction: (userData: RegisterApiPayload) => Promise<{ success: boolean; error?: unknown }>;
  logoutAction: () => void;
}

// Create the context with type annotation, initialized to null
export const AuthContext = createContext<AuthContextType | null>(null);

// Type for the AuthProvider component's props
interface AuthProviderProps {
    children: ReactNode;
}

// --- AuthProvider Component ---

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Effect to check for token and fetch user on initial load (client-side)
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false); // No token found, stop loading
    }
    // Disabling dependency array warning as fetchUser depends on handleLogout which depends on state/router.
    // Re-fetching user only needs to happen if token changes, handled by initial load/login/register.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch user data using a valid token
  const fetchUser = async (currentToken: string) => {
     setLoading(true);
     try {
       const config = { headers: { Authorization: `Token ${currentToken}` } };
       // Expect API to return data matching the User interface
       const response = await apiClient.get<User>('/user/', config);
       setUser(response.data);
     } catch (error) {
       console.error('Failed to fetch user (likely invalid token):', error);
       // If fetching user fails, assume token is invalid and log out
       handleLogout();
     } finally {
       setLoading(false);
     }
   };

  // Function to handle user login
  const loginAction = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: unknown }> => {
    setLoading(true);
    try {
        // Expected response structure from backend login endpoint
        interface LoginResponse {
            token: string;
            user_id: number; // Assuming backend sends these fields
            username: string;
            email: string;
        }
      const response = await apiClient.post<LoginResponse>('/login/', credentials);
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      // Set user state based on login response data
      setUser({ id: userData.user_id, username: userData.username, email: userData.email });

      router.push('/dashboard'); // Redirect on successful login
      return { success: true };

    } catch (error) {
      let errorData: unknown = 'Login failed'; // Default error
      if (axios.isAxiosError(error)) {
          console.error('Login failed (Axios):', error.response?.data || error.message);
          errorData = error.response?.data || error.message; // Extract backend error details
      } else {
          console.error('Login failed (Non-Axios):', error);
          if (error instanceof Error) errorData = error.message; // Use standard error message
      }
      setLoading(false); // Stop loading on error
      return { success: false, error: errorData };
    }
    // setLoading automatically stops on success due to redirect/remount
  };

  // Function to handle user registration
  // Accepts payload *without* password2
  const registerAction = async (userData: RegisterApiPayload): Promise<{ success: boolean; error?: unknown }> => {
    setLoading(true);
    try {
        // Expected response structure from backend register endpoint
        interface RegisterResponse {
            token: string;
            user: User; // Expect the full user object
        }
      // Send userData directly (it should not contain password2)
      const response = await apiClient.post<RegisterResponse>('/register/', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(newUser); // Set user state with the returned user object

      router.push('/dashboard'); // Redirect on successful registration
      return { success: true };

    } catch (error) {
        let errorData: unknown = 'Registration failed'; // Default error
        if (axios.isAxiosError(error)) {
            console.error('Registration failed (Axios):', error.response?.data || error.message);
             console.error("Backend Error Details:", error.response?.data); // Log specific backend validation errors
            errorData = error.response?.data || error.message; // Extract backend error details
        } else {
            console.error('Registration failed (Non-Axios):', error);
             if (error instanceof Error) errorData = error.message;
        }
        setLoading(false); // Stop loading on error
        return { success: false, error: errorData };
    }
     // setLoading automatically stops on success due to redirect/remount
  };

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    // Use replace to prevent logged-out pages from being in browser history
    router.replace('/login');
  };

  // Value object provided by the context
  const value: AuthContextType = {
    user,
    token,
    loading,
    loginAction,
    registerAction,
    logoutAction: handleLogout, // Provide the logout handler
    isAuthenticated: !!token && !!user, // Boolean check for authentication status
  };

  // Return the provider wrapping the children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};