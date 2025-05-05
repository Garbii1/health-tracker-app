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

// Zod schema for goal form validation
const goalSchema = z.object({
  goal_text: z.string().min(5, { message: 'Goal description must be at least 5 characters' }),
});

// Infer type
type GoalFormInputs = z.infer<typeof goalSchema>;

// API Payload type
type GoalPayload = GoalFormInputs; // In this case, it's the same

const AddGoalPage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<GoalFormInputs>({
    resolver: zodResolver(goalSchema),
  });

  const onSubmit: SubmitHandler<GoalFormInputs> = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      const payload: GoalPayload = {
          goal_text: data.goal_text,
      };

      await apiClient.post('/goals/', payload);
      router.push('/dashboard'); // Redirect on success
    } catch (err: any) {
      console.error('Failed to add goal:', err.response?.data || err.message);
      const errorDetail = err.response?.data?.detail || err.response?.data?.goal_text || JSON.stringify(err.response?.data) || 'Failed to save goal. Please try again.';
      setApiError(errorDetail);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Add Fitness Goal">
        <div className="max-w-xl mx-auto mt-8">
           <Link href="/dashboard" className="inline-flex items-center text-sm text-primary hover:text-primary-dark mb-4">
               <ArrowLeftIcon className="h-4 w-4 mr-1" />
               Back to Dashboard
           </Link>

          <div className="bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-primary mb-6">Set New Fitness Goal</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                  {apiError}
                </div>
              )}

              {/* Goal Text */}
              <div>
                <label htmlFor="goal_text" className="block text-sm font-medium text-text_secondary mb-1">Goal Description *</label>
                <textarea
                  id="goal_text"
                  rows={4}
                  {...register('goal_text')}
                  placeholder="e.g., Run a 5k in under 30 minutes"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.goal_text ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.goal_text?.message && <p className="text-red-500 text-xs mt-1">{errors.goal_text.message}</p>}
              </div>


              <button type="submit" disabled={loading}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Save Goal'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default AddGoalPage;