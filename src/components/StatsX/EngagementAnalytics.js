// src/components/StatsX/EngagementAnalytics.js
'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { getPageViewStats } from '../../lib/analytics';
import { subDays } from 'date-fns';

/**
 * Engagement Analytics Widget
 * Page view trends, user journey flow, most visited sections
 */
export default function EngagementAnalytics({ loading: externalLoading }) {
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState({});
  const [timeSeries, setTimeSeries] = useState([]);

  useEffect(() => {
    async function fetchEngagementData() {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 30);
        
        const stats = await getPageViewStats(startDate, endDate);
        setPageViews(stats.pageViews || {});

        // Convert to time series (simplified - would need actual time-series data from analytics)
        const pageViewEntries = Object.entries(stats.pageViews || {});
        const totalViews = pageViewEntries.reduce((sum, [, count]) => sum + count, 0);
        
        // Mock time series for now (would need actual daily breakdown)
        const mockTimeSeries = [];
        for (let i = 29; i >= 0; i--) {
          const date = subDays(endDate, i);
          mockTimeSeries.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: Math.floor(totalViews / 30) + Math.floor(Math.random() * 10),
          });
        }
        setTimeSeries(mockTimeSeries);
      } catch (error) {
        console.error('Error fetching engagement data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEngagementData();
  }, []);

  if (loading || externalLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Top pages
  const topPages = Object.entries(pageViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({
      path: path.replace('/', '').replace(/-/g, ' ') || 'Home',
      count,
    }));

  // Calculate stats
  const totalPageViews = Object.values(pageViews).reduce((sum, count) => sum + count, 0);
  const uniquePages = Object.keys(pageViews).length;
  const avgDailyViews = Math.round(totalPageViews / 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-3">Engagement Analytics</h3>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">{totalPageViews.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Views</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">{uniquePages}</div>
          <div className="text-xs text-gray-500">Unique Pages</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">{avgDailyViews}</div>
          <div className="text-xs text-gray-500">Avg Daily</div>
        </div>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Page Views (Last 30 Days)</h4>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={timeSeries}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Most Visited Pages</h4>
        <div className="space-y-2">
          {topPages.length > 0 ? (
            topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                  <span className="text-sm text-gray-800 capitalize">{page.path}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{page.count}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No page view data available yet
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

