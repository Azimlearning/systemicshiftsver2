// src/components/StatsX/StatsDashboard.js
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { trackPageView } from '../../lib/analytics';
import { motion } from 'framer-motion';
import { FaFileAlt, FaUsers, FaChartLine, FaDatabase } from 'react-icons/fa';
import MetricCard from './MetricCard';
import CohortHeatmap from './CohortHeatmap';
import AnomalyDetector from './AnomalyDetector';
import AIInsightsTicker from './AIInsightsTicker';
import StoryAnalytics from './StoryAnalytics';
import MeetingAnalytics from './MeetingAnalytics';
import EngagementAnalytics from './EngagementAnalytics';
import KnowledgeBaseAnalytics from './KnowledgeBaseAnalytics';
import ArticleEngagement from './ArticleEngagement';
import DataGenerator from './DataGenerator';

// Safe Dynamic Import for the Chart
const TrendChart = dynamic(() => import('./TrendChart'), { 
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm h-full flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading Chart...</div>
    </div>
  )
});

export default function StatsDashboard({ initialData }) {
  // Initialize with data passed from the Server Page
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [selectedMetric, setSelectedMetric] = useState('combined');
  const [filters, setFilters] = useState({});

  // Track page view on mount
  useEffect(() => {
    trackPageView('/statsx', 'StatsX Analytics Dashboard');
  }, []);

  // Handle cross-filtering
  const handleFilter = (filterType, filterValue) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: filterValue,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <>
      {/* Rotating Banner - Full Width */}
      <div className="mb-6">
        <AIInsightsTicker data={data} loading={loading} />
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <MetricCard
          title="Stories"
          value={data?.stories?.total || 0}
          change={data?.comparisons?.stories?.growth || 0}
          icon={FaFileAlt}
          color="teal"
          loading={loading}
        />
        <MetricCard
          title="Meetings"
          value={data?.meetings?.total || 0}
          change={data?.comparisons?.meetings?.growth || 0}
          icon={FaUsers}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Engagement"
          value={data?.meetings?.aiUsageRate?.toFixed(1) || 0}
          change={0}
          changeLabel="AI usage rate"
          icon={FaChartLine}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Knowledge Base"
          value={data?.knowledgeBase?.total || 0}
          change={0}
          changeLabel="Total documents"
          icon={FaDatabase}
          color="amber"
          loading={loading}
        />
      </div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 2: TrendChart (with metric selector), AnomalyDetector, StoryAnalytics */}
        <div className="col-span-1">
          <TrendChart
            data={data}
            loading={loading}
            showForecast={true}
            showAnomalies={true}
            metric="combined"
            filters={filters}
            onFilter={handleFilter}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </div>

        <div className="col-span-1">
          <AnomalyDetector data={data} loading={loading} />
        </div>
        <div className="col-span-1">
          <StoryAnalytics data={data} loading={loading} filters={filters} onFilter={handleFilter} />
        </div>
        <div className="col-span-1">
          <MeetingAnalytics data={data} loading={loading} filters={filters} onFilter={handleFilter} />
        </div>

        {/* Row 4: EngagementAnalytics, KnowledgeBaseAnalytics, ArticleEngagement */}
        <div className="col-span-1">
          <EngagementAnalytics loading={loading} />
        </div>
        <div className="col-span-1">
          <KnowledgeBaseAnalytics data={data} loading={loading} />
        </div>
        <div className="col-span-1">
          <ArticleEngagement loading={loading} />
        </div>

        <div className="col-span-1">
          <CohortHeatmap data={data} loading={loading} filters={filters} onFilter={handleFilter} />
        </div>
        <div className="col-span-1">
          <DataGenerator />
        </div>
        <div className="col-span-1">
          {/* Empty - can be used for future components */}
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-3xl flex items-center gap-2 flex-wrap shadow-sm"
        >
          <span className="text-sm font-medium text-teal-800">Active Filters:</span>
          {Object.entries(filters).map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded flex items-center gap-1"
            >
              {key}: {value}
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  setFilters(newFilters);
                }}
                className="hover:text-teal-900"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-teal-600 hover:text-teal-800 underline"
          >
            Clear all
          </button>
        </motion.div>
      )}
    </>
  );
}

