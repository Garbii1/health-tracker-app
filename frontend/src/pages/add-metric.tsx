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

// Zod schema for metric form validation
const metricSchema = z.object({
  weight: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ invalid_type_error: 'Must be a number' })
            .positive({ message: 'Weight must be positive' })
            .optional()
  ),
  steps: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ invalid_type_error: 'Must be a number' })
            .int({ message: 'Steps must be a whole number' })
            .nonnegative({ message: 'Steps cannot be negative' })
            .optional()
  ),
  heart_rate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ invalid_type_error: 'Must be a number' })
             .int({ message: 'Heart rate must be a whole number' })
             .positive({ message: 'Heart rate must be positive' })
             .optional()
  ),
  // Use string for datetime-local input, convert on submit
  timestamp: z.string().optional(),
}).refine(data => data.weight !== undefined || data.steps !== undefined || data.heart_rate !== undefined, {
     message: "At least one metric (Weight, Steps, or Heart Rate) must be provided.",
     // Apply error to a field that's likely to be present or a general form error later
     path: ["weight"],
});

// Infer type from schema
type MetricFormInputs = z.infer<typeof metricSchema>;

// Type for the payload sent to the API (optional fields)
interface MetricPayload {
    weight?: number;
    steps?: number;
    heart_rate?: number;
    timestamp?: string; // ISO string
}

const AddMetricPage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<MetricFormInputs>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
        // Ensure default values match optional nature if needed
    }
  });

  const onSubmit: SubmitHandler<MetricFormInputs> = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      // Build payload carefully, only including defined values
      const payload: MetricPayload = {};
      if (data.weight !== undefined) payload.weight = data.weight;
      if (data.steps !== undefined) payload.steps = data.steps;
      if (data.heart_rate !== undefined) payload.heart_rate = data.heart_rate;
      // Convert timestamp string to ISO string if present
      if (data.timestamp) {
          try {
             payload.timestamp = new Date(data.timestamp).toISOString();
          } catch (dateError) {
              console.error("Invalid date format for timestamp:", data.timestamp);
              setApiError("Invalid date/time provided for timestamp.");
              setLoading(false);
              return; // Stop submission if date is invalid
          }
      }

      await apiClient.post('/metrics/', payload);
      router.push('/dashboard'); // Redirect to dashboard on success
    } catch (err: any) {
      console.error('Failed to add metric:', err.response?.data || err.message);
      // Try to get more specific error message from backend
      const errorDetail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save metric. Please try again.';
      setApiError(errorDetail);
      setLoading(false);
    }
    // No need to setLoading(false) on success because of redirect
  };

  return (
    <ProtectedRoute>
      <Layout title="Add Health Metric">
        <div className="max-w-xl mx-auto mt-8">
           <Link href="/dashboard" className="inline-flex items-center text-sm text-primary hover:text-primary-dark mb-4">
               <ArrowLeftIcon className="h-4 w-4 mr-1" />
               Back to Dashboard
           </Link>

          <div className="bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-primary mb-6">Log New Health Metric</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                  {apiError}
                </div>
              )}
              {/* Display the specific "at least one metric" error */}
              {errors.weight?.message?.includes('one metric') && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-text_secondary mb-1">Weight (kg/lbs)</label>
                <input type="number" step="0.1" id="weight" {...register('weight')} placeholder="e.g., 75.5"
                       className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.weight ? 'border-red-500' : 'border-gray-300'}`} />
                {/* Don't show the refine error message again if already shown above */}
                {errors.weight?.message && !errors.weight.message.includes('one metric') && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
              </div>

              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-text_secondary mb-1">Steps</label>
                <input type="number" id="steps" {...register('steps')} placeholder="e.g., 10000"
                       className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.steps ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.steps?.message && <p className="text-red-500 text-xs mt-1">{errors.steps.message}</p>}
              </div>

              <div>
                <label htmlFor="heart_rate" className="block text-sm font-medium text-text_secondary mb-1">Heart Rate (BPM)</label>
                <input type="number" id="heart_rate" {...register('heart_rate')} placeholder="e.g., 70"
                       className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.heart_rate ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.heart_rate?.message && <p className="text-red-500 text-xs mt-1">{errors.heart_rate.message}</p>}
              </div>

              <div>
                 <label htmlFor="timestamp" className="block text-sm font-medium text-text_secondary mb-1">Timestamp (Optional)</label>
                 {/* Input type remains datetime-local */}
                 <input type="datetime-local" id="timestamp" {...register('timestamp')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.timestamp ? 'border-red-500' : 'border-gray-300'}`} />
                 <p className="text-xs text-gray-500 mt-1">Leave blank to record the current time.</p>
                 {errors.timestamp?.message && <p className="text-red-500 text-xs mt-1">{errors.timestamp.message}</p>}
              </div>


              <button type="submit" disabled={loading}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Save Metric'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default AddMetricPage;