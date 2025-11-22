// src/components/StatsX/StoryAnalytics.js
'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'];

/**
 * Story Analytics Widget
 * Submission trends, breakdown by keyShifts and focusAreas
 */
export default function StoryAnalytics({ data, loading, filters = {}, onFilter }) {
  const [view, setView] = useState('trends'); // 'trends', 'keyShifts', 'focusAreas'

  if (loading || !data?.stories) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { stories } = data;

  // Prepare key shifts data
  const keyShiftsData = Object.entries(stories.keyShiftsCount || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Prepare focus areas data
  const focusAreasData = Object.entries(stories.focusAreasCount || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Time series for trends
  const trendsData = (stories.timeSeries || []).slice(-30).map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    submissions: point.value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">Story Analytics</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView('trends')}
            className={`px-3 py-1 text-sm rounded-xl transition-colors ${
              view === 'trends'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setView('keyShifts')}
            className={`px-3 py-1 text-sm rounded-xl transition-colors ${
              view === 'keyShifts'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Key Shifts
          </button>
          <button
            onClick={() => setView('focusAreas')}
            className={`px-3 py-1 text-sm rounded-xl transition-colors ${
              view === 'focusAreas'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Focus Areas
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-gray-800">{stories.total}</div>
            <div className="text-xs text-gray-500">Total Stories</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-gray-800">
              {stories.averagePerDay?.toFixed(1) || 0}
            </div>
            <div className="text-xs text-gray-500">Avg per Day</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-gray-800">
              {Object.keys(stories.keyShiftsCount || {}).length}
            </div>
            <div className="text-xs text-gray-500">Key Shifts</div>
          </div>
        </div>

        {view === 'trends' && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="submissions" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === 'keyShifts' && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={keyShiftsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#8b5cf6" 
              radius={[0, 4, 4, 0]}
              onClick={(data) => {
                if (onFilter && data?.name) {
                  onFilter('keyShift', data.name);
                }
              }}
              style={{ cursor: onFilter ? 'pointer' : 'default' }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === 'focusAreas' && (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={focusAreasData.slice(0, 6)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {focusAreasData.slice(0, 6).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

