// src/components/StatsX/AnomalyDetector.js
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { highlightAnomalies, getAnomalyStats } from '../../lib/anomalyDetection';

/**
 * AI Anomaly Detection Widget
 * Shows detected anomalies with visual indicators
 */
export default function AnomalyDetector({ data, loading }) {
  const anomalyStats = useMemo(() => {
    if (!data || loading) return null;

    // Analyze stories time series
    const storiesAnomalies = data.stories?.timeSeries
      ? highlightAnomalies(data.stories.timeSeries, { method: 'rolling', windowSize: 14 })
      : [];
    
    // Analyze meetings time series
    const meetingsAnomalies = data.meetings?.timeSeries
      ? highlightAnomalies(data.meetings.timeSeries, { method: 'rolling', windowSize: 14 })
      : [];

    const storiesStats = getAnomalyStats(storiesAnomalies);
    const meetingsStats = getAnomalyStats(meetingsAnomalies);

    return {
      stories: storiesStats,
      meetings: meetingsStats,
      overall: {
        total: storiesStats.total + meetingsStats.total,
        spikes: storiesStats.spikes + meetingsStats.spikes,
        dips: storiesStats.dips + meetingsStats.dips,
      },
    };
  }, [data, loading]);

  if (loading || !anomalyStats) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasAnomalies = anomalyStats.overall.total > 0;
  const statusColor = hasAnomalies ? 'text-red-600' : 'text-green-600';
  const statusBg = hasAnomalies ? 'bg-red-50' : 'bg-green-50';
  const statusBorder = hasAnomalies ? 'border-red-200' : 'border-green-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl border ${statusBorder} p-4 shadow-sm h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">Anomaly Detection</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusBg}`}>
          {hasAnomalies ? (
            <>
              <FaExclamationTriangle className={statusColor} />
              <span className={`text-sm font-medium ${statusColor}`}>Anomalies Detected</span>
            </>
          ) : (
            <>
              <FaCheckCircle className={statusColor} />
              <span className={`text-sm font-medium ${statusColor}`}>Normal</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-800">{anomalyStats.overall.total}</div>
          <div className="text-xs text-gray-500">Total Anomalies</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-red-600">{anomalyStats.overall.spikes}</div>
          <div className="text-xs text-gray-500">Spikes</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-blue-600">{anomalyStats.overall.dips}</div>
          <div className="text-xs text-gray-500">Dips</div>
        </div>
      </div>

      {hasAnomalies && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Recent Anomalies:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {[...anomalyStats.stories.recentAnomalies, ...anomalyStats.meetings.recentAnomalies]
              .slice(0, 5)
              .map((anomaly, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded ${
                    anomaly.type === 'spike' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {anomaly.date}: {anomaly.type === 'spike' ? 'Unusual spike' : 'Unusual dip'} (
                  {Math.abs(anomaly.deviation).toFixed(1)}σ)
                </div>
              ))}
          </div>
        </div>
      )}

      {!hasAnomalies && (
        <p className="text-sm text-gray-500 text-center py-4">
          No anomalies detected in the current time period. All metrics are within normal ranges.
        </p>
      )}
    </motion.div>
  );
}

