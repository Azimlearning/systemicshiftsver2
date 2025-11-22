// src/components/StatsX/PulseWidget.js
'use client';

import { FaFileAlt, FaUsers, FaChartLine, FaDatabase } from 'react-icons/fa';
import MetricCard from './MetricCard';

/**
 * Real-time health metrics widget (4 small cards)
 */
export default function PulseWidget({ data, loading, gridMode = false }) {
  const metrics = [
    {
      title: 'Stories',
      value: data?.stories?.total || 0,
      change: data?.comparisons?.stories?.growth || 0,
      icon: FaFileAlt,
      color: 'teal',
    },
    {
      title: 'Meetings',
      value: data?.meetings?.total || 0,
      change: data?.comparisons?.meetings?.growth || 0,
      icon: FaUsers,
      color: 'purple',
    },
    {
      title: 'Engagement',
      value: data?.meetings?.aiUsageRate?.toFixed(1) || 0,
      change: 0, // Can be calculated from analytics
      changeLabel: 'AI usage rate',
      icon: FaChartLine,
      color: 'blue',
    },
    {
      title: 'Knowledge Base',
      value: data?.knowledgeBase?.total || 0,
      change: 0,
      changeLabel: 'Total documents',
      icon: FaDatabase,
      color: 'amber',
    },
  ];

  if (gridMode) {
    // For flexible grid: each card spans 1 column
    return (
      <>
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="col-span-1"
          >
            <MetricCard
              {...metric}
              loading={loading}
            />
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          {...metric}
          loading={loading}
        />
      ))}
    </div>
  );
}

