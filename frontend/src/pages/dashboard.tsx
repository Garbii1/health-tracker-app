import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import apiClient from '@/lib/axios';
// Removed unused useAuth import
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import axios from 'axios'; // Import axios for type checking

// Import types
import { HealthMetric, Meal, FitnessGoal } from '@/types'; // Adjust path as needed

// Import Components
import HealthMetricsChart from '@/components/charts/HealthMetricsChart';
import MetricsList from '@/components/dashboard/MetricsList';
import MealsList from '@/components/dashboard/MealsList';
import GoalsList from '@/components/dashboard/GoalsList';

// Typed Components
const LoadingSpinner: React.FC = () => <div className="text-center p-4">Loading data...</div>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <div className="text-center p-4 text-red-600 bg-red-100 border border-red-300 rounded">{message}</div>;

const DashboardPage: NextPage = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, mealsRes, goalsRes] = await Promise.all([
        apiClient.get<HealthMetric[]>('/metrics/'),
        apiClient.get<Meal[]>('/meals/'),
        apiClient.get<FitnessGoal[]>('/goals/'),
      ]);
      setMetrics(metricsRes.data);
      setMeals(mealsRes.data);
      setGoals(goalsRes.data);
    } catch (error) { // Use generic error, check type below
      console.error("Error fetching dashboard data:", error);
      let errorMsg = "Failed to load dashboard data. Please try again later.";
       if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 401) {
                errorMsg = "Authentication error. Please log in again.";
                // Consider triggering logout from AuthContext if interceptor doesn't handle it
            }
       }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = (): void => {
      fetchData();
  }

  // ---- Delete Handlers ----
  const handleDeleteMetric = async (id: number): Promise<void> => {
      if (!window.confirm("Are you sure you want to delete this metric record?")) return;
      try {
          await apiClient.delete(`/metrics/${id}/`);
          refreshData();
      } catch (error) { // Use generic error, check type below
           if (axios.isAxiosError(error)) {
               console.error("Failed to delete metric (Axios):", error.response?.data || error.message);
           } else {
                console.error("Failed to delete metric (Non-Axios):", error);
           }
          alert("Failed to delete metric record.");
      }
  };

  const handleDeleteMeal = async (id: number): Promise<void> => {
      if (!window.confirm("Are you sure you want to delete this meal log?")) return;
      try {
          await apiClient.delete(`/meals/${id}/`);
          refreshData();
      } catch (error) { // Use generic error, check type below
           if (axios.isAxiosError(error)) {
               console.error("Failed to delete meal (Axios):", error.response?.data || error.message);
           } else {
                console.error("Failed to delete meal (Non-Axios):", error);
           }
          alert("Failed to delete meal log.");
      }
  };

  const handleDeleteGoal = async (id: number): Promise<void> => {
       if (!window.confirm("Are you sure you want to delete this goal?")) return;
       try {
           await apiClient.delete(`/goals/${id}/`);
           refreshData();
       } catch (error) { // Use generic error, check type below
           if (axios.isAxiosError(error)) {
               console.error("Failed to delete goal (Axios):", error.response?.data || error.message);
           } else {
                console.error("Failed to delete goal (Non-Axios):", error);
           }
           alert("Failed to delete goal.");
       }
   };

  // ---- Toggle Goal Completion ----
   const handleToggleGoal = async (goal: FitnessGoal): Promise<void> => {
      try {
         await apiClient.patch(`/goals/${goal.id}/`, { completed: !goal.completed });
         refreshData();
      } catch (error) { // Use generic error, check type below
           if (axios.isAxiosError(error)) {
               console.error("Failed to update goal status (Axios):", error.response?.data || error.message);
           } else {
                console.error("Failed to update goal status (Non-Axios):", error);
           }
         alert("Failed to update goal status.");
      }
   };

  return (
    <ProtectedRoute>
      <Layout title="Dashboard">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h1>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="space-y-8">
            {/* Section 1: Health Metrics Chart & List */}
            <section className="bg-surface p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-primary">Health Metrics</h2>
                 {/* Use updated Link syntax (remove legacyBehavior and inner <a>) */}
                 <Link href="/add-metric" className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Metric</span>
                 </Link>
              </div>
              {metrics.length > 0 ? (
                 <div className='mb-6 h-64 md:h-80'>
                     <HealthMetricsChart data={metrics} />
                 </div>
              ) : (
                 <p className="text-text_secondary italic mb-4">No metrics logged yet. Add one to see the chart!</p>
              )}
              <MetricsList metrics={metrics} onDelete={handleDeleteMetric} />
            </section>

            {/* Section 2: Meal Log */}
            <section className="bg-surface p-6 rounded-lg shadow-md">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary">Meal Log</h2>
                  <Link href="/add-meal" className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                     <PlusIcon className="h-4 w-4" />
                     <span>Add Meal</span>
                 </Link>
               </div>
              <MealsList meals={meals} onDelete={handleDeleteMeal} />
            </section>

            {/* Section 3: Fitness Goals */}
            <section className="bg-surface p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">Fitness Goals</h2>
                    <Link href="/add-goal" className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                       <PlusIcon className="h-4 w-4" />
                       <span>Add Goal</span>
                    </Link>
                 </div>
              <GoalsList goals={goals} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />
            </section>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}

export default DashboardPage;