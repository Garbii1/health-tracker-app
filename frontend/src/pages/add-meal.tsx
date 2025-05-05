import React, { useState } from 'react';
import Layout from '@/components/common/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import axios from 'axios'; // Import axios for type checking

// Zod schema for meal form validation
const mealSchema = z.object({
  name: z.string().min(1, { message: 'Meal name is required' }),
  calories: z.coerce
    .number({ invalid_type_error: 'Calories must be a number' })
    .int({ message: 'Calories must be a whole number' })
    .positive({ message: 'Calories must be positive' }),
  timestamp: z.string().optional(),
});

// Infer type from schema
type MealFormInputs = z.infer<typeof mealSchema>;

// API Payload type
interface MealPayload {
    name: string;
    calories: number;
    timestamp?: string; // ISO string
}

const AddMealPage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<MealFormInputs>({
    resolver: zodResolver(mealSchema),
  });

  const onSubmit: SubmitHandler<MealFormInputs> = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      const payload: MealPayload = {
          name: data.name,
          calories: data.calories,
      };
       if (data.timestamp) {
          try {
             payload.timestamp = new Date(data.timestamp).toISOString();
          } catch (error) { // Catch specific date conversion error
              console.error("Invalid date format for timestamp:", data.timestamp, error); // Log the error
              setApiError("Invalid date/time provided for timestamp.");
              setLoading(false);
              return;
          }
      }

      await apiClient.post('/meals/', payload);
      router.push('/dashboard');
    } catch (error) { // Use generic error, check type below
        let errorDetail = 'Failed to save meal. Please try again.';
         if (axios.isAxiosError(error)) {
             console.error('Failed to add meal (Axios):', error.response?.data || error.message);
             const backendError = error.response?.data;
             errorDetail = backendError?.detail || JSON.stringify(backendError) || error.message;
         } else {
              console.error('Failed to add meal (Non-Axios):', error);
         }
      setApiError(errorDetail);
      setLoading(false); // Ensure loading stops on error
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Add Meal Log">
        <div className="max-w-xl mx-auto mt-8">
           <Link href="/dashboard" className="inline-flex items-center text-sm text-primary hover:text-primary-dark mb-4">
               <ArrowLeftIcon className="h-4 w-4 mr-1" />
               Back to Dashboard
           </Link>

          <div className="bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-primary mb-6">Log New Meal</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                  {apiError}
                </div>
              )}

              {/* Meal Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text_secondary mb-1">Meal Name *</label>
                <input type="text" id="name" {...register('name')} placeholder="e.g., Chicken Salad"
                       className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.name?.message && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Calories */}
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-text_secondary mb-1">Calories (kcal) *</label>
                <input type="number" id="calories" {...register('calories')} placeholder="e.g., 450"
                       className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.calories ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.calories?.message && <p className="text-red-500 text-xs mt-1">{errors.calories.message}</p>}
              </div>

              {/* Timestamp (Optional) */}
              <div>
                 <label htmlFor="timestamp" className="block text-sm font-medium text-text_secondary mb-1">Timestamp (Optional)</label>
                 <input type="datetime-local" id="timestamp" {...register('timestamp')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.timestamp ? 'border-red-500' : 'border-gray-300'}`} />
                 <p className="text-xs text-gray-500 mt-1">Leave blank to record the current time.</p>
                 {errors.timestamp?.message && <p className="text-red-500 text-xs mt-1">{errors.timestamp.message}</p>}
              </div>


              <button type="submit" disabled={loading}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Save Meal'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default AddMealPage;