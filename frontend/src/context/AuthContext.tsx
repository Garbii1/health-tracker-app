import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import apiClient from '@/lib/axios'; // Adjust path if needed
import { useRouter } from 'next/router';

// Define types for User and Context
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string; // Make optional if not always present
  last_name?: string;  // Make optional
  // Add other user fields if your UserSerializer returns them
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginAction: (credentials: any) => Promise<{ success: boolean; error?: any }>; // Define specific type for credentials later
  registerAction: (userData: any) => Promise<{ success: boolean; error?: any }>; // Define specific type for userData later
  logoutAction: () => void;
}

// Create context with the defined type, initialized to null
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode; // Type for children prop
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading until checked
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage on initial load (client-side only)
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken); // Fetch user data if token exists
    } else {
      setLoading(false); // No token, stop loading
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Added eslint-disable to prevent warning about missing fetchUser dependency if desired

  const fetchUser = async (currentToken: string) => {
     setLoading(true);
     try {
       // Set token for this specific request if not already set globally by interceptor
       const config = { headers: { Authorization: `Token ${currentToken}` } };
       const response = await apiClient.get<User>('/user/', config); // Expect User type in response
       setUser(response.data);
     } catch (error: any) { // Use 'any' or a more specific error type
       console.error('Failed to fetch user:', error);
       // Token might be invalid, clear it
       handleLogout(); // Changed to avoid naming conflict
     } finally {
       setLoading(false);
     }
   };

  // Define credential type based on login form/schema
  type LoginCredentials = z.infer<typeof loginSchema>; // Assuming loginSchema is imported or defined

  const loginAction = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: any }> => {
    setLoading(true);
    try {
        // Define expected response type from login endpoint
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
      router.push('/dashboard'); // Redirect after login
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      setLoading(false);
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  // Define user data type based on registration form/schema
   type RegisterUserData = z.infer<typeof registerSchema>; // Assuming registerSchema is imported or defined

  const registerAction = async (userData: RegisterUserData): Promise<{ success: boolean; error?: any }> => {
    setLoading(true);
    try {
        // Define expected response type from register endpoint
        interface RegisterResponse {
            token: string;
            user: User;
        }
      const response = await apiClient.post<RegisterResponse>('/register/', userData);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(newUser);
      router.push('/dashboard'); // Redirect after registration
       return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      setLoading(false);
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  // Renamed to avoid conflict with the function name itself
  const handleLogout = () => {
    setLoading(true);
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    loginAction,
    registerAction,
    logoutAction: handleLogout, // Use renamed function
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Import Zod and schemas if using inferred types (adjust paths)
import * as z from 'zod';
// Assuming loginSchema and registerSchema are defined in login.tsx/register.tsx or a shared types file
// e.g., import { loginSchema } from '@/pages/login';
// Placeholder schemas if not imported:
const loginSchema = z.object({ username: z.string(), password: z.string() });
const registerSchema = z.object({ username: z.string(), email: z.string(), password: z.string(), password2: z.string() });