// src/components/StatsX/ArticleEngagement.js
'use client';

import { motion } from 'framer-motion';
import { FaFileAlt } from 'react-icons/fa';

/**
 * Article Engagement Analytics Widget
 * Coming soon placeholder for article analytics
 */
export default function ArticleEngagement({ loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm h-full">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaFileAlt className="text-teal-600 text-xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Article Engagement</h3>
        <p className="text-sm text-gray-500">Coming Soon</p>
        <p className="text-xs text-gray-400 mt-2">Article analytics will be available here</p>
      </div>
    </motion.div>
  );
}

