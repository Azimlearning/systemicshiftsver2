// src/components/StatsX/AIInsightsTicker.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AI Insights Ticker - Simple rotating banner with insights
 * Compares week-over-week metrics and displays key findings
 */
export default function AIInsightsTicker({ data, loading }) {
  const [currentInsight, setCurrentInsight] = useState(0);

  // Generate insights
  const insights = useMemo(() => {
    if (!data) return [];
    
    const insightsList = [];

    // Story insights
    if (data.stories?.total > 0) {
      const storiesGrowth = data.comparisons?.stories?.growth || 0;
      if (Math.abs(storiesGrowth) > 5) {
        insightsList.push({
          icon: '📈',
          text: `Story submissions ${storiesGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(storiesGrowth).toFixed(1)}% compared to last week`,
          type: storiesGrowth > 0 ? 'positive' : 'negative',
        });
      }
    }

    // Meeting insights
    if (data.meetings?.total > 0) {
      const meetingsGrowth = data.comparisons?.meetings?.growth || 0;
      const aiUsageRate = data.meetings?.aiUsageRate || 0;
      
      if (Math.abs(meetingsGrowth) > 5) {
        insightsList.push({
          icon: '👥',
          text: `Meeting activity ${meetingsGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(meetingsGrowth).toFixed(1)}% week-over-week`,
          type: meetingsGrowth > 0 ? 'positive' : 'negative',
        });
      }

      if (aiUsageRate > 50) {
        insightsList.push({
          icon: '🤖',
          text: `AI insights are being used in ${aiUsageRate.toFixed(0)}% of meetings, showing strong adoption`,
          type: 'positive',
        });
      }
    }

    // Engagement insights
    const totalActivity = (data.stories?.total || 0) + (data.meetings?.total || 0);
    if (totalActivity > 0) {
      const avgPerDay = (data.stories?.averagePerDay || 0) + (data.meetings?.averagePerDay || 0);
      if (avgPerDay > 5) {
        insightsList.push({
          icon: '🚀',
          text: `Average daily activity is ${avgPerDay.toFixed(1)} items, indicating strong engagement`,
          type: 'positive',
        });
      }
    }

    // Knowledge base insights
    if (data.knowledgeBase?.total > 0) {
      const topCategory = data.knowledgeBase?.topCategories?.[0];
      if (topCategory) {
        insightsList.push({
          icon: '📚',
          text: `${topCategory.name} is the most popular knowledge category with ${topCategory.count} documents`,
          type: 'neutral',
        });
      }
    }

    // Default insight if none generated
    if (insightsList.length === 0) {
      insightsList.push({
        icon: '📊',
        text: 'Dashboard is tracking activity across stories, meetings, and knowledge base',
        type: 'neutral',
      });
    }

    return insightsList;
  }, [data]);

  useEffect(() => {
    if (insights.length === 0) return;

    const interval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % insights.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [insights.length]);

  if (loading || !data || insights.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-teal-50 to-purple-50 rounded-2xl border border-teal-200 p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  const insight = insights[currentInsight];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-teal-50 to-purple-50 rounded-2xl border border-teal-200 p-4 shadow-sm"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2 text-center"
            >
              <span className="text-xl">{insight.icon}</span>
              <p className="text-sm font-medium text-gray-800">
                {insight.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {insights.length > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentInsight(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentInsight
                    ? 'w-6 bg-teal-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to insight ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

