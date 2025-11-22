// src/components/StatsX/KnowledgeBaseAnalytics.js
'use client';

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

const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#ec4899'];

/**
 * Knowledge Base Analytics Widget
 * Document access patterns, category popularity, search query trends
 */
export default function KnowledgeBaseAnalytics({ data, loading }) {
  if (loading || !data?.knowledgeBase) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { knowledgeBase } = data;

  // Category data
  const categoryData = (knowledgeBase.topCategories || []).map(cat => ({
    name: cat.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: cat.count,
  }));

  // Tag data (top 10)
  const tagData = (knowledgeBase.topTags || []).slice(0, 10).map(tag => ({
    name: tag.name.length > 15 ? tag.name.substring(0, 15) + '...' : tag.name,
    value: tag.count,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-3">Knowledge Base Analytics</h3>

      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-800">{knowledgeBase.total}</div>
          <div className="text-xs text-gray-500">Total Documents</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-800">
            {knowledgeBase.topCategories?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Categories</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-gray-800">
            {knowledgeBase.topTags?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Tags</div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Categories</h4>
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={categoryData.slice(0, 6)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.slice(0, 6).map((entry, index) => (
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
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Tags</h4>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={tagData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

