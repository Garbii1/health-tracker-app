// frontend/src/types/index.ts

// Match the fields returned by your Django serializers

export interface HealthMetric {
    id: number;
    user?: string; // username, read-only from serializer
    weight: number | null; // Use number | null if field can be null
    steps: number | null;
    heart_rate: number | null;
    timestamp: string; // ISO string format from backend
}

export interface Meal {
    id: number;
    user?: string;
    name: string;
    calories: number;
    timestamp: string;
}

export interface FitnessGoal {
    id: number;
    user?: string;
    goal_text: string;
    created_at: string;
    completed: boolean;
    completed_at: string | null; // Can be null
}

// You might also reuse the User type from AuthContext here
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}