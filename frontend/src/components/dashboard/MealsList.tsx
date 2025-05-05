import React from 'react';
import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';
// Import type
import { Meal } from '@/types'; // Adjust path

// Define component props type
interface MealsListProps {
    meals: Meal[];
    onDelete: (id: number) => void;
}

const MealsList: React.FC<MealsListProps> = ({ meals, onDelete }) => {
  if (!meals || meals.length === 0) {
    return <p className="text-text_secondary italic">No meals logged yet.</p>;
  }

  return (
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Date</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Meal Name</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Calories (kcal)</th>
            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-text_secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {meals.map((meal) => (
            <tr key={meal.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {meal.timestamp ? format(new Date(meal.timestamp), 'PPp') : 'Invalid Date'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{meal.name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{meal.calories}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {/* <Link href={`/edit-meal/${meal.id}`}> ... </Link> */}
                <button onClick={() => onDelete(meal.id)} className="text-red-600 hover:text-red-800" title="Delete">
                   <TrashIcon className="h-4 w-4 inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MealsList;