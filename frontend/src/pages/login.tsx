import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Adjust path
import Layout from '@/components/common/Layout'; // Adjust path
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { NextPage } from 'next'; // Optional: Type for Next.js page component

// Define Zod schema for validation
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Infer the type from the schema
type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: NextPage = () => { // Use NextPage type
  const { loginAction, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null); // Type state

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({ // Use inferred type
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);


  // Type the data parameter based on the inferred type
  const onSubmit = async (data: LoginFormInputs) => {
    setApiError(null); // Clear previous errors
    const result = await loginAction(data); // loginAction expects this type now
    if (!result.success) {
      // Handle specific backend errors if possible (type result.error if known)
      if (result.error?.non_field_errors && Array.isArray(result.error.non_field_errors)) {
        setApiError(result.error.non_field_errors.join(', '));
      } else {
        setApiError('Login failed. Please check your username and password.');
      }
    }
     // Redirect happens within loginAction on success
  };

  if (isAuthenticated) {
     return <Layout title="Redirecting..."><div className='text-center p-10'>Loading...</div></Layout>;
  }

  return (
    <Layout title="Login">
      <div className="max-w-md mx-auto mt-10 bg-surface p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Login</h1>
        {/* Type the event handler if needed, though handleSubmit handles it */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text_secondary mb-1">Username</label>
            <input
              type="text"
              id="username"
              {...register('username')} // register is typed via useForm
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            />
             {/* Use optional chaining for safety */}
             {errors.username?.message && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text_secondary mb-1">Password</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password?.message && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-text_secondary mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
             Register here
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export default LoginPage;