import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from 'recharts'; // Import TooltipProps
import { format } from 'date-fns';
// Import type
import { HealthMetric } from '@/types'; // Adjust path
// Import types for recharts Tooltip payload
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// Define props type
interface HealthMetricsChartProps {
    data: HealthMetric[];
}

// Define type for processed chart data point
interface ChartDataPoint {
    timestamp: string;
    Weight?: number; // Optional because value might be null
    Steps?: number;
    'Heart Rate'?: number;
}

const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({ data }) => {
  // Prepare data for the chart
  const chartData: ChartDataPoint[] = data
    .slice() // Create a copy
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Ensure correct date sorting
    .map(metric => ({
      timestamp: format(new Date(metric.timestamp), 'MMM d'),
      // Use undefined if value is null/invalid so recharts skips the point
      Weight: metric.weight !== null ? Number(metric.weight) : undefined,
      Steps: metric.steps !== null ? Number(metric.steps) : undefined,
      'Heart Rate': metric.heart_rate !== null ? Number(metric.heart_rate) : undefined,
    }));

   // Custom Tooltip Component - Type using TooltipProps
   const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
     if (active && payload && payload.length) {
       return (
         <div className="bg-white p-2 border border-gray-300 rounded shadow-md text-sm">
           <p className="font-semibold">{label}</p>
           {payload.map((entry, index) => (
              // Check if value is defined and not undefined
              entry.value !== undefined && (
                 <p key={`item-${index}`} style={{ color: entry.color }}>
                   {`${entry.name}: ${entry.value}`}
                   {/* Add units */}
                   {entry.name === 'Weight' && ' kg/lbs'}
                   {entry.name === 'Heart Rate' && ' bpm'}
                 </p>
              )
           ))}
         </div>
       );
     }
     return null;
   };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="timestamp" fontSize={10} tick={{ fill: '#6b7280' }} />
        <YAxis yAxisId="left" fontSize={10} tick={{ fill: '#6b7280' }} />
        {/* Add tickFormatter to Y axis if needed for formatting numbers */}
        {/* <YAxis yAxisId="left" fontSize={10} tick={{ fill: '#6b7280' }} tickFormatter={(value) => value.toFixed(1)} /> */}

        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

        {/* Use keyof ChartDataPoint for dataKey */}
        <Line yAxisId="left" type="monotone" dataKey="Weight" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} connectNulls={true} dot={false}/>
        <Line yAxisId="left" type="monotone" dataKey="Steps" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} connectNulls={true} dot={false}/>
        <Line yAxisId="left" type="monotone" dataKey="Heart Rate" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} connectNulls={true} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HealthMetricsChart;