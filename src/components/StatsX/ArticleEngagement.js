// src/components/StatsX/ArticleEngagement.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaEye, FaHeart, FaComment } from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { getAllArticleEngagement, getAnalyticsEvents } from '../../lib/analytics';
import { subDays, format } from 'date-fns';

/**
 * Article Engagement Analytics Widget
 * Displays views, likes, and comments analytics for all articles
 */
export default function ArticleEngagement({ loading: externalLoading }) {
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [totalStats, setTotalStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalArticles: 0,
  });

  useEffect(() => {
    async function fetchEngagementData() {
      setLoading(true);
      try {
        // Get all article engagement data
        const allEngagement = await getAllArticleEngagement();
        setEngagementData(allEngagement);

        // Calculate totals
        const totals = allEngagement.reduce(
          (acc, article) => ({
            totalViews: acc.totalViews + (article.views || 0),
            totalLikes: acc.totalLikes + (article.likes || 0),
            totalComments: acc.totalComments + (article.comments || 0),
            totalArticles: acc.totalArticles + 1,
          }),
          { totalViews: 0, totalLikes: 0, totalComments: 0, totalArticles: 0 }
        );
        setTotalStats(totals);

        // Calculate category statistics
        const categoryData = {};
        allEngagement.forEach((article) => {
          const category = article.category || 'uncategorized';
          if (!categoryData[category]) {
            categoryData[category] = {
              views: 0,
              likes: 0,
              comments: 0,
              articles: 0,
            };
          }
          categoryData[category].views += article.views || 0;
          categoryData[category].likes += article.likes || 0;
          categoryData[category].comments += article.comments || 0;
          categoryData[category].articles += 1;
        });
        setCategoryStats(categoryData);

        // Generate time series data (last 30 days)
        const endDate = new Date();
        const startDate = subDays(endDate, 30);
        const events = await getAnalyticsEvents(startDate, endDate, 'article_view');
        
        // Group by date
        const dailyData = {};
        for (let i = 29; i >= 0; i--) {
          const date = subDays(endDate, i);
          const dateStr = format(date, 'MMM dd');
          dailyData[dateStr] = { date: dateStr, views: 0, likes: 0, comments: 0 };
        }

        // Populate with actual data
        events.forEach((event) => {
          const eventDate = event.timestamp?.toDate() || new Date();
          const dateStr = format(eventDate, 'MMM dd');
          if (dailyData[dateStr]) {
            dailyData[dateStr].views += 1;
          }
        });

        setTimeSeriesData(Object.values(dailyData));
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
      <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm h-full">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Prepare category chart data
  const categoryChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    category: category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    views: stats.views,
    likes: stats.likes,
    comments: stats.comments,
  }));

  // Top articles
  const topArticles = [...engagementData]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm h-full hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
          <FaFileAlt className="text-teal-600 text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Article Engagement</h3>
          <p className="text-sm text-gray-700">All articles analytics</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-teal-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <FaEye className="text-sm" />
            <span className="text-xs font-medium">Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStats.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <FaHeart className="text-sm" />
            <span className="text-xs font-medium">Likes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStats.totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FaComment className="text-sm" />
            <span className="text-xs font-medium">Comments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStats.totalComments.toLocaleString()}</p>
        </div>
      </div>

      {/* Time Series Chart */}
      {timeSeriesData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Views Over Time (Last 30 Days)</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Comparison */}
      {categoryChartData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Engagement by Category</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#14b8a6" name="Views" />
              <Bar dataKey="likes" fill="#ef4444" name="Likes" />
              <Bar dataKey="comments" fill="#3b82f6" name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Articles */}
      {topArticles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Articles by Views</h4>
          <div className="space-y-2">
            {topArticles.map((article, idx) => (
              <div key={article.articleId || idx} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                <span className="text-gray-600 truncate flex-1">
                  {article.articleTitle || `Article ${article.articleId}`}
                </span>
                <span className="text-teal-600 font-semibold ml-2">{article.views || 0} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {engagementData.length === 0 && (
        <div className="text-center py-8 text-gray-700">
          <p className="text-sm">No article engagement data yet</p>
          <p className="text-xs mt-1">Data will appear as users interact with articles</p>
        </div>
      )}
    </motion.div>
  );
}

