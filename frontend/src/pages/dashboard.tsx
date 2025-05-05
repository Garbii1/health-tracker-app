import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import apiClient from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth'; // Use useAuth to ensure user context is available
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline'; // Icons for actions
import type { NextPage } from 'next';

// Import types (adjust path if you created types/index.ts)
import { HealthMetric, Meal, FitnessGoal } from '@/types';

// Import Chart component
import HealthMetricsChart from '@/components/charts/HealthMetricsChart';

// Import components for displaying data
import MetricsList from '@/components/dashboard/MetricsList';
import MealsList from '@/components/dashboard/MealsList';
import GoalsList from '@/components/dashboard/GoalsList';

// Type components
const LoadingSpinner: React.FC = () => <div className="text-center p-4">Loading data...</div>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <div className="text-center p-4 text-red-600 bg-red-100 border border-red-300 rounded">{message}</div>;


const DashboardPage: NextPage = () => {
  // No need to get user from useAuth unless displaying specific info not in lists
  // const { user } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]); // Type state arrays
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Promise.all to fetch data concurrently
      // Specify expected data types for API responses
      const [metricsRes, mealsRes, goalsRes] = await Promise.all([
        apiClient.get<HealthMetric[]>('/metrics/'),
        apiClient.get<Meal[]>('/meals/'),
        apiClient.get<FitnessGoal[]>('/goals/'),
      ]);
      setMetrics(metricsRes.data);
      setMeals(mealsRes.data);
      setGoals(goalsRes.data);
    } catch (err: any) { // Use any or AxiosError
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      if (err.response && err.response.status === 401) {
          setError("Authentication error. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when component mounts
  }, []); // Empty dependency array ensures it runs only once on mount

  // Function to refetch data after adding/editing/deleting
  const refreshData = (): void => { // Add return type void
      fetchData();
  }

  // ---- Delete Handlers ----
  const handleDeleteMetric = async (id: number): Promise<void> => { // Type parameters/return
      if (!window.confirm("Are you sure you want to delete this metric record?")) return;
      try {
          await apiClient.delete(`/metrics/${id}/`);
          refreshData(); // Refresh list
      } catch (err: any) {
          console.error("Failed to delete metric:", err);
          alert("Failed to delete metric record."); // Consider a more robust notification system
      }
  };

  const handleDeleteMeal = async (id: number): Promise<void> => {
      if (!window.confirm("Are you sure you want to delete this meal log?")) return;
      try {
          await apiClient.delete(`/meals/${id}/`);
          refreshData();
      } catch (err: any) {
          console.error("Failed to delete meal:", err);
          alert("Failed to delete meal log.");
      }
  };

  const handleDeleteGoal = async (id: number): Promise<void> => {
       if (!window.confirm("Are you sure you want to delete this goal?")) return;
       try {
           await apiClient.delete(`/goals/${id}/`);
           refreshData();
       } catch (err: any) {
           console.error("Failed to delete goal:", err);
           alert("Failed to delete goal.");
       }
   };

  // ---- Toggle Goal Completion ----
   const handleToggleGoal = async (goal: FitnessGoal): Promise<void> => { // Type goal parameter
      try {
         // Send only the 'completed' field for patch
         await apiClient.patch(`/goals/${goal.id}/`, { completed: !goal.completed });
         refreshData();
      } catch (err: any) {
         console.error("Failed to update goal status:", err);
         alert("Failed to update goal status.");
      }
   };

  return (
    <ProtectedRoute> {/* Wrap content in ProtectedRoute */}
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
                 <Link href="/add-metric" legacyBehavior>
                    <a className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Metric</span>
                    </a>
                 </Link>
              </div>
              {/* Chart */}
              {metrics.length > 0 ? (
                 <div className='mb-6 h-64 md:h-80'> {/* Responsive height container */}
                     <HealthMetricsChart data={metrics} />
                 </div>

              ) : (
                 <p className="text-text_secondary italic mb-4">No metrics logged yet. Add one to see the chart!</p>
              )}
              {/* List */}
              <MetricsList metrics={metrics} onDelete={handleDeleteMetric} />
            </section>

            {/* Section 2: Meal Log */}
            <section className="bg-surface p-6 rounded-lg shadow-md">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary">Meal Log</h2>
                  <Link href="/add-meal" legacyBehavior>
                    <a className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                       <PlusIcon className="h-4 w-4" />
                       <span>Add Meal</span>
                    </a>
                 </Link>
               </div>
              <MealsList meals={meals} onDelete={handleDeleteMeal} />
            </section>

            {/* Section 3: Fitness Goals */}
            <section className="bg-surface p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">Fitness Goals</h2>
                     <Link href="/add-goal" legacyBehavior>
                        <a className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                           <PlusIcon className="h-4 w-4" />
                           <span>Add Goal</span>
                       </a>
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