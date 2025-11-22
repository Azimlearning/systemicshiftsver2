// src/components/StatsX/MeetingAnalytics.js
'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

/**
 * Meeting Analytics Widget
 * Meeting count trends, action item completion rates, AI insights usage
 */
export default function MeetingAnalytics({ data, loading, filters = {}, onFilter }) {
  if (loading || !data?.meetings) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { meetings } = data;

  // Time series data
  const trendsData = (meetings.timeSeries || []).slice(-30).map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    meetings: point.value,
  }));

  // Calculate action item stats (mock data for now, would need actual completion tracking)
  const actionItemStats = {
    total: meetings.totalActionItems || 0,
    completed: Math.floor((meetings.totalActionItems || 0) * 0.65), // Mock 65% completion
    pending: Math.floor((meetings.totalActionItems || 0) * 0.35),
  };

  const completionData = [
    { name: 'Completed', value: actionItemStats.completed, color: '#10b981' },
    { name: 'Pending', value: actionItemStats.pending, color: '#f59e0b' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-3">Meeting Analytics</h3>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">{meetings.total}</div>
          <div className="text-xs text-gray-500">Total Meetings</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">
            {meetings.averagePerDay?.toFixed(1) || 0}
          </div>
          <div className="text-xs text-gray-500">Avg per Day</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">{meetings.totalActionItems}</div>
          <div className="text-xs text-gray-500">Action Items</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">
            {meetings.aiUsageRate?.toFixed(0) || 0}%
          </div>
          <div className="text-xs text-gray-500">AI Usage</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Meeting Trends (Last 30 Days)</h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="meetings"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">Action Item Completion</h4>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
              {completionData.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {actionItemStats.total > 0
            ? `${((actionItemStats.completed / actionItemStats.total) * 100).toFixed(0)}% completion rate`
            : 'No action items tracked'}
        </div>
      </div>
    </motion.div>
  );
}

