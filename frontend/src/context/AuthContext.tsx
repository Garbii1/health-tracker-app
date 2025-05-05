import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/router';
// Import only 'axios' for the isAxiosError check, removed unused AxiosError type
import axios from 'axios';

// Import schemas from their respective pages
import { loginSchema } from '@/pages/login';
import { registerSchema } from '@/pages/register';
import * as z from 'zod';

// --- Types ---
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}
type LoginCredentials = z.infer<typeof loginSchema>;
// Exclude password2 when defining the type for data sent to the API
type RegisterApiPayload = Omit<z.infer<typeof registerSchema>, 'password2'>;

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  // Use specific types for params, use 'unknown' for error return type
  loginAction: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: unknown }>;
  registerAction: (userData: RegisterApiPayload) => Promise<{ success: boolean; error?: unknown }>;
  logoutAction: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async (currentToken: string) => {
     setLoading(true);
     try {
       const config = { headers: { Authorization: `Token ${currentToken}` } };
       const response = await apiClient.get<User>('/user/', config);
       setUser(response.data);
     } catch (error) {
       // Don't need specific error handling here, just log out
       console.error('Failed to fetch user (likely invalid token):', error);
       handleLogout();
     } finally {
       setLoading(false);
     }
   };

  const loginAction = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: unknown }> => {
    setLoading(true);
    try {
        interface LoginResponse {
            token: string;
            user_id: number;
            username: string;
            email: string;
        }
      const response = await apiClient.post<LoginResponse>('/login/', credentials);
      const { token: newToken, ...userData } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser({ id: userData.user_id, username: userData.username, email: userData.email });
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      let errorData: unknown = 'Login failed'; // Use unknown type
      if (axios.isAxiosError(error)) {
          console.error('Login failed (Axios):', error.response?.data || error.message);
          errorData = error.response?.data || error.message;
      } else {
          console.error('Login failed (Non-Axios):', error);
          if (error instanceof Error) errorData = error.message; // Get message if standard Error
      }
      setLoading(false);
      return { success: false, error: errorData };
    }
  };


  // Parameter type now matches the data sent to API (password2 excluded)
  const registerAction = async (userData: RegisterApiPayload): Promise<{ success: boolean; error?: unknown }> => {
    setLoading(true);
    try {
        interface RegisterResponse {
            token: string;
            user: User;
        }
      const response = await apiClient.post<RegisterResponse>('/register/', userData);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(newUser);
      router.push('/dashboard');
       return { success: true };
    } catch (error) {
        let errorData: unknown = 'Registration failed'; // Use unknown type
        if (axios.isAxiosError(error)) {
            console.error('Registration failed (Axios):', error.response?.data || error.message);
            errorData = error.response?.data || error.message;
        } else {
            console.error('Registration failed (Non-Axios):', error);
             if (error instanceof Error) errorData = error.message;
        }
        setLoading(false);
        return { success: false, error: errorData };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    loginAction,
    registerAction,
    logoutAction: handleLogout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};