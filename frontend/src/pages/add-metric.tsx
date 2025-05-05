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
import axios from 'axios';

// --- Simplified Zod Schema ---
// Validate as optional/nullable strings, potentially check format, but coerce later.
const metricSchema = z.object({
  weight: z.string()
    .optional()
    .nullable()
    // Optional: Basic regex to ensure it looks numeric if provided
    .refine((val) => val == null || val === "" || /^\d+(\.\d+)?$/.test(val), {
      message: "Weight must be a valid number",
    }),
  steps: z.string()
    .optional()
    .nullable()
    // Optional: Basic regex for whole numbers
    .refine((val) => val == null || val === "" || /^\d+$/.test(val), {
      message: "Steps must be a valid whole number",
    }),
  heart_rate: z.string()
    .optional()
    .nullable()
    // Optional: Basic regex for whole numbers
    .refine((val) => val == null || val === "" || /^\d+$/.test(val), {
        message: "Heart rate must be a valid whole number",
    }),
  timestamp: z.string().optional(),
})
// Refine based on the string presence (or null/undefined)
.refine(data => data.weight != null || data.steps != null || data.heart_rate != null, {
     message: "At least one metric (Weight, Steps, or Heart Rate) must be provided.",
     path: ["weight"], // Assign error to one field
});

// --- Type inferred from simplified schema ---
// Will be { weight?: string | null | undefined; steps?: string | null | undefined; ... }
type MetricFormInputs = z.infer<typeof metricSchema>;

// --- API Payload type remains the same (expects numbers or null) ---
interface MetricPayload {
    weight?: number | null;
    steps?: number | null;
    heart_rate?: number | null;
    timestamp?: string; // ISO string
}

const AddMetricPage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  // Keep track of manual conversion errors
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Use the inferred type (string | null | undefined)
  const { register, handleSubmit, formState: { errors } } = useForm<MetricFormInputs>({
    resolver: zodResolver(metricSchema), // Resolver now expects string | null | undefined
    defaultValues: { // Defaults should be strings or undefined/null
        weight: '',
        steps: '',
        heart_rate: '',
        timestamp: '',
    }
  });

  // --- onSubmit now handles coercion ---
  const onSubmit: SubmitHandler<MetricFormInputs> = async (data) => {
    setLoading(true);
    setApiError(null);
    setConversionError(null); // Clear conversion errors

    try {
      // --- Manual Coercion and Validation ---
      const payload: MetricPayload = {};
      let hasConversionError = false;

      // Weight
      if (data.weight != null && data.weight !== '') {
        const numWeight = Number(data.weight);
        if (!isNaN(numWeight) && numWeight > 0) {
          payload.weight = numWeight;
        } else {
          setConversionError("Invalid value entered for Weight.");
          hasConversionError = true;
        }
      } else {
        payload.weight = null; // Send null if empty/null/undefined
      }

      // Steps
      if (data.steps != null && data.steps !== '') {
        const numSteps = Number(data.steps);
        // Check for integer and non-negative
        if (!isNaN(numSteps) && Number.isInteger(numSteps) && numSteps >= 0) {
          payload.steps = numSteps;
        } else {
          setConversionError("Invalid value entered for Steps (must be a whole number).");
          hasConversionError = true;
        }
      } else {
         payload.steps = null;
      }

      // Heart Rate
       if (data.heart_rate != null && data.heart_rate !== '') {
        const numHeartRate = Number(data.heart_rate);
         // Check for integer and positive
        if (!isNaN(numHeartRate) && Number.isInteger(numHeartRate) && numHeartRate > 0) {
          payload.heart_rate = numHeartRate;
        } else {
          setConversionError("Invalid value entered for Heart Rate (must be a positive whole number).");
          hasConversionError = true;
        }
      } else {
         payload.heart_rate = null;
      }

      // Timestamp
      if (data.timestamp) {
          try {
             payload.timestamp = new Date(data.timestamp).toISOString();
          } catch (error) {
              console.error("Invalid date format for timestamp:", data.timestamp, error);
              // Use setConversionError instead of setApiError for this type of client-side issue
              setConversionError("Invalid date/time provided for timestamp.");
              hasConversionError = true;
          }
      }
      // --- End Coercion ---

      // If conversion failed, stop submission
      if (hasConversionError) {
          setLoading(false);
          return;
      }

      // Proceed with API call using the coerced payload
      await apiClient.post('/metrics/', payload);
      router.push('/dashboard');

    } catch (error) { // Handle API errors
      let errorDetail = 'Failed to save metric. Please try again.';
       if (axios.isAxiosError(error)) {
           console.error('API Error:', error.response?.data || error.message);
           const backendError = error.response?.data;
           if (typeof backendError === 'object' && backendError !== null) {
               errorDetail = backendError.detail || JSON.stringify(backendError);
           } else if (typeof backendError === 'string') {
               errorDetail = backendError;
           } else {
               errorDetail = error.message;
           }
       } else {
            console.error('Non-API Error:', error);
            if (error instanceof Error) errorDetail = error.message;
       }
      setApiError(errorDetail);
      setLoading(false);
    }
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
              {/* Display API or Conversion errors */}
              {(apiError || conversionError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                  {apiError || conversionError}
                </div>
              )}
              {/* Display Zod refine error */}
              {errors.weight?.message?.includes('one metric') && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}

              {/* Inputs remain type="number" for browser UI/keyboard hints */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-text_secondary mb-1">Weight (kg/lbs)</label>
                <input type="number" step="0.1" id="weight" {...register('weight')} placeholder="e.g., 75.5"
                       className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${errors.weight ? 'border-red-500' : 'border-gray-300'}`} />
                {/* Display field-specific Zod errors (excluding refine message) */}
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
};

export default AddMetricPage;