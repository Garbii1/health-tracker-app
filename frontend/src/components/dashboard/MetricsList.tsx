import React from 'react';
import { format } from 'date-fns'; // Use a date formatting library
import { TrashIcon } from '@heroicons/react/24/outline';
// Import type
import { HealthMetric } from '@/types'; // Adjust path

// Define component props type
interface MetricsListProps {
    metrics: HealthMetric[];
    onDelete: (id: number) => void; // Function prop type
    // onEdit?: (id: number) => void; // Optional edit handler
}

const MetricsList: React.FC<MetricsListProps> = ({ metrics, onDelete }) => {
  if (!metrics || metrics.length === 0) {
    return <p className="text-text_secondary italic">No metrics recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Date</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Weight (kg/lbs)</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Steps</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text_secondary uppercase tracking-wider">Heart Rate (BPM)</th>
            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-text_secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric) => (
            <tr key={metric.id}>
              {/* Ensure timestamp is valid before formatting */}
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {metric.timestamp ? format(new Date(metric.timestamp), 'PPp') : 'Invalid Date'}
              </td>
              {/* Use nullish coalescing for potentially null values */}
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{metric.weight ?? 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{metric.steps ?? 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{metric.heart_rate ?? 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {/* Add Edit Link later if needed */}
                {/* <Link href={`/edit-metric/${metric.id}`}> ... </Link> */}
                <button onClick={() => onDelete(metric.id)} className="text-red-600 hover:text-red-800" title="Delete">
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

export default MetricsList;