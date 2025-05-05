import React from 'react';
import { format } from 'date-fns';
import { TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
// Import type
import { FitnessGoal } from '@/types'; // Adjust path

// Define component props type
interface GoalsListProps {
    goals: FitnessGoal[];
    onToggle: (goal: FitnessGoal) => void; // Pass the whole goal object
    onDelete: (id: number) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({ goals, onToggle, onDelete }) => {
  if (!goals || goals.length === 0) {
    return <p className="text-text_secondary italic">No fitness goals set yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {goals.map((goal) => (
        <li key={goal.id} className="py-3 flex items-center justify-between">
          <div className="flex items-start space-x-3">
              <button onClick={() => onToggle(goal)} className="flex-shrink-0 mt-1" title={goal.completed ? "Mark as Incomplete" : "Mark as Complete"}>
                {goal.completed ? (
                  <CheckCircleSolid className="h-6 w-6 text-green-500" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-gray-400 hover:text-green-500" />
                )}
              </button>
            <div>
              <p className={`text-sm font-medium text-gray-900 ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                {goal.goal_text}
              </p>
              <p className="text-xs text-text_secondary">
                Created: {goal.created_at ? format(new Date(goal.created_at), 'PP') : ''}
                {goal.completed && goal.completed_at ? ` | Completed: ${format(new Date(goal.completed_at), 'PP')}` : ''}
              </p>
            </div>
          </div>
          <button onClick={() => onDelete(goal.id)} className="text-red-600 hover:text-red-800 ml-4" title="Delete Goal">
            <TrashIcon className="h-5 w-5" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default GoalsList;