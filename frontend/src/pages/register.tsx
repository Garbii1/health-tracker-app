import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Adjust path
import Layout from '@/components/common/Layout'; // Adjust path
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form'; // Import SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { NextPage } from 'next';

// Define Zod schema for validation
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  password2: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
}).refine(data => data.password === data.password2, {
  message: "Passwords don't match",
  path: ["password2"], // path of error
});

// Infer the type from the schema
type RegisterFormInputs = z.infer<typeof registerSchema>;

// Define type for API errors (can be more specific if backend structure is known)
interface ApiErrorType {
    [key: string]: string | undefined; // Allows field names like 'username', 'email', etc.
    form?: string; // For general form errors
}

const RegisterPage: NextPage = () => {
  const { registerAction, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<ApiErrorType>({}); // Type state for API errors

   const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
         first_name: '',
         last_name: '',
      }
   });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Use SubmitHandler with the inferred type
  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setApiErrors({}); // Clear previous API errors
    // Ensure password2 is not sent to the backend if your API doesn't expect it
    const { password2, ...payload } = data;
    const result = await registerAction(payload); // Pass the cleaned payload

    if (!result.success) {
      if (typeof result.error === 'object' && result.error !== null) {
         // Map backend field errors to our form state
         const backendErrors: ApiErrorType = {};
         for (const key in result.error) {
            // Assuming error[key] is an array of strings from DRF
            if (Array.isArray(result.error[key])) {
                backendErrors[key] = result.error[key].join(', ');
            } else {
                 backendErrors[key] = String(result.error[key]); // Handle non-array errors
            }
         }
         setApiErrors(backendErrors);
      } else {
         // Generic error
         setApiErrors({ form: result.error || 'Registration failed. Please try again.' });
      }
    }
    // Redirect happens within registerAction on success
  };

  if (isAuthenticated) {
      return <Layout title="Redirecting..."><div className='text-center p-10'>Loading...</div></Layout>;
  }

  return (
    <Layout title="Register">
      <div className="max-w-lg mx-auto mt-10 bg-surface p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiErrors.form && ( // Display generic form error
            (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiErrors.form}</span>
            </div>)
          )}

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text_secondary mb-1">Username *</label>
            <input type="text" id="username" {...register('username')}
                   className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${(errors.username || apiErrors.username) ? 'border-red-500' : 'border-gray-300'}`} />
            {(errors.username?.message || apiErrors.username) && <p className="text-red-500 text-xs mt-1">{errors.username?.message || apiErrors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text_secondary mb-1">Email *</label>
            <input type="email" id="email" {...register('email')}
                   className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${(errors.email || apiErrors.email) ? 'border-red-500' : 'border-gray-300'}`} />
            {(errors.email?.message || apiErrors.email) && <p className="text-red-500 text-xs mt-1">{errors.email?.message || apiErrors.email}</p>}
          </div>

           {/* Optional First/Last Name */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label htmlFor="first_name" className="block text-sm font-medium text-text_secondary mb-1">First Name</label>
               <input type="text" id="first_name" {...register('first_name')}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`} />
               {errors.first_name?.message && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
             </div>
             <div>
               <label htmlFor="last_name" className="block text-sm font-medium text-text_secondary mb-1">Last Name</label>
               <input type="text" id="last_name" {...register('last_name')}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`} />
               {errors.last_name?.message && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
             </div>
           </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text_secondary mb-1">Password *</label>
            <input type="password" id="password" {...register('password')}
                   className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${(errors.password || apiErrors.password) ? 'border-red-500' : 'border-gray-300'}`} />
            {(errors.password?.message || apiErrors.password) && <p className="text-red-500 text-xs mt-1">{errors.password?.message || apiErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-text_secondary mb-1">Confirm Password *</label>
            <input type="password" id="password2" {...register('password2')}
                   className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.password2 ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.password2?.message && <p className="text-red-500 text-xs mt-1">{errors.password2.message}</p>}
          </div>

          <button type="submit" disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
         <p className="text-center text-sm text-text_secondary mt-6">
           Already have an account?{' '}
           <Link href="/login" className="text-primary hover:underline font-medium">
             Login here
           </Link>
         </p>
      </div>
    </Layout>
  );
}

export default RegisterPage;