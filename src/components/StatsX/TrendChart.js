// src/components/StatsX/TrendChart.js
'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { forecast } from '../../lib/forecasting';
import { highlightAnomalies, formatAnomalyLabel } from '../../lib/anomalyDetection';
import { motion } from 'framer-motion';

// Helper function to safely parse dates
const safeParseDate = (dateInput) => {
  try {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return new Date();
      return dateInput;
    }
    if (typeof dateInput === 'string') {
      try {
        const parsed = parseISO(dateInput);
        if (!isNaN(parsed.getTime())) return parsed;
      } catch (e) {
        // Try standard Date parsing as fallback
        const parsed = new Date(dateInput);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    return new Date();
  } catch (e) {
    console.warn('Date parsing error:', e);
    return new Date();
  }
};

/**
 * Main multi-layered area chart with forecasting and anomaly detection
 */
export default function TrendChart({ 
  data, 
  loading,
  showForecast = true,
  showAnomalies = true,
  metric = 'stories', // 'stories', 'meetings', or 'combined'
  filters = {},
  onFilter,
  selectedMetric,
  onMetricChange
}) {
  const [scale, setScale] = useState('linear');

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Trend Chart</h3>
            <p className="text-sm text-gray-500 mt-1">No data available</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Waiting for data...</p>
        </div>
      </div>
    );
  }

  // Use selectedMetric if provided, otherwise use metric prop
  const activeMetric = selectedMetric || metric;
  
  // Ensure activeMetric is valid, default to 'combined' if invalid
  const validMetric = ['stories', 'meetings', 'combined'].includes(activeMetric) 
    ? activeMetric 
    : 'combined';

  // Prepare data based on metric
  let timeSeries = [];
  let forecastData = [];
  let anomalyData = [];

  if (validMetric === 'stories' && data.stories?.timeSeries) {
    timeSeries = Array.isArray(data.stories.timeSeries) 
      ? data.stories.timeSeries.map(point => ({
          ...point,
          timestamp: point.timestamp || safeParseDate(point.date),
        }))
      : [];
  } else if (validMetric === 'meetings' && data.meetings?.timeSeries) {
    timeSeries = Array.isArray(data.meetings.timeSeries) 
      ? data.meetings.timeSeries.map(point => ({
          ...point,
          timestamp: point.timestamp || safeParseDate(point.date),
        }))
      : [];
  } else if (validMetric === 'combined') {
    // Combine stories and meetings
    const storiesMap = new Map();
    const meetingsMap = new Map();

    if (Array.isArray(data.stories?.timeSeries)) {
      data.stories.timeSeries.forEach(point => {
        if (point && point.date !== undefined && point.value !== undefined) {
          storiesMap.set(point.date, point.value);
        }
      });
    }

    if (Array.isArray(data.meetings?.timeSeries)) {
      data.meetings.timeSeries.forEach(point => {
        if (point && point.date !== undefined && point.value !== undefined) {
          meetingsMap.set(point.date, point.value);
        }
      });
    }

    const allDates = new Set([...storiesMap.keys(), ...meetingsMap.keys()]);
    timeSeries = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        value: (storiesMap.get(date) || 0) + (meetingsMap.get(date) || 0),
        timestamp: safeParseDate(date),
      }));
  }
  
  // Ensure timeSeries is an array
  if (!Array.isArray(timeSeries)) {
    timeSeries = [];
  }

  // Generate forecast
  if (showForecast && timeSeries.length > 0) {
    try {
      if (typeof forecast === 'function') {
        // Ensure all timeSeries points have required fields
        const validTimeSeries = timeSeries.filter(p => 
          p && 
          p.date !== undefined && 
          p.value !== undefined && 
          !isNaN(Number(p.value))
        );
        
        if (validTimeSeries.length > 0) {
          forecastData = forecast(validTimeSeries, 30, 'smooth');
          if (!Array.isArray(forecastData)) {
            throw new Error('Forecast function did not return an array');
          }
        } else {
          forecastData = timeSeries.map(p => ({ ...p, isForecast: false }));
        }
      } else {
        throw new Error('Forecast function is not available');
      }
    } catch (e) {
      console.warn('Forecast generation failed:', e);
      forecastData = timeSeries.map(p => ({ ...p, isForecast: false }));
    }
  } else {
    forecastData = timeSeries.map(p => ({ ...p, isForecast: false }));
  }

  // Detect anomalies
  if (showAnomalies && timeSeries.length > 0) {
    try {
      if (typeof highlightAnomalies === 'function') {
        // Ensure all timeSeries points have required fields for anomaly detection
        const validTimeSeries = timeSeries.filter(p => 
          p && 
          p.date !== undefined && 
          p.value !== undefined && 
          !isNaN(Number(p.value))
        );
        
        if (validTimeSeries.length >= 14) { // Need at least windowSize points
          anomalyData = highlightAnomalies(validTimeSeries, { method: 'rolling', windowSize: 14 });
          if (!Array.isArray(anomalyData)) {
            anomalyData = [];
          }
        } else {
          anomalyData = [];
        }
      } else {
        anomalyData = [];
      }
    } catch (e) {
      console.warn('Anomaly detection failed:', e);
      anomalyData = [];
    }
  } else {
    anomalyData = [];
  }

  // Ensure forecastData is an array
  if (!Array.isArray(forecastData)) {
    forecastData = [];
  }

  // Format data for Recharts
  const chartData = forecastData.map((point, index) => {
    const anomaly = anomalyData.find(a => a.date === point.date);
    let dateLabel = '';
    let dateValue = point.date || '';
    
    try {
      // Handle different date formats
      if (point.date) {
        if (point.date instanceof Date) {
          dateValue = point.date.toISOString();
          dateLabel = format(point.date, 'MMM dd');
        } else if (typeof point.date === 'string') {
          dateValue = point.date;
          try {
            const dateObj = safeParseDate(point.date);
            dateLabel = format(dateObj, 'MMM dd');
          } catch (e) {
            // Fallback to simple string
            dateLabel = point.date.length > 10 ? point.date.substring(0, 10) : point.date;
          }
        } else {
          dateLabel = String(point.date);
        }
      } else {
        // No date, use index
        dateLabel = `Day ${index + 1}`;
        dateValue = `day-${index + 1}`;
      }
    } catch (e) {
      // Ultimate fallback
      dateLabel = point.date ? String(point.date).substring(0, 10) : `Point ${index + 1}`;
      dateValue = point.date || `point-${index + 1}`;
    }
    
    let anomalyLabel = null;
    if (anomaly) {
      try {
        anomalyLabel = formatAnomalyLabel(anomaly);
      } catch (e) {
        console.warn('Failed to format anomaly label:', e);
        anomalyLabel = 'Anomaly detected';
      }
    }
    
    return {
      date: dateValue,
      dateLabel,
      value: point.value || 0,
      isForecast: point.isForecast || false,
      isAnomaly: anomaly?.isAnomaly || false,
      anomalyType: anomaly?.type || null,
      anomalyLabel,
    };
  });

  // Ensure chartData is valid
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {validMetric === 'stories' ? 'Story Submissions' : 
               validMetric === 'meetings' ? 'Meetings Created' : 
               'Combined Activity'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Trend over time with forecasting</p>
          </div>
          <div className="flex items-center gap-2">
            {onMetricChange && (
              <select
                value={validMetric}
                onChange={(e) => onMetricChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <option value="combined">Combined Activity</option>
                <option value="stories">Stories</option>
                <option value="meetings">Meetings</option>
              </select>
            )}
            <button
              onClick={() => setScale(scale === 'linear' ? 'log' : 'linear')}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              {scale === 'linear' ? 'Log Scale' : 'Linear Scale'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No data available</p>
        </div>
      </motion.div>
    );
  }

  // Separate historical and forecast data for different styling
  const historicalData = chartData.filter(d => !d.isForecast);
  const forecastedData = chartData.filter(d => d.isForecast);

  // Find anomalies for annotation
  const anomalies = chartData.filter(d => d.isAnomaly && !d.isForecast);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm h-full hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {validMetric === 'stories' ? 'Story Submissions' : 
             validMetric === 'meetings' ? 'Meetings Created' : 
             'Combined Activity'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Trend over time with forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          {onMetricChange && (
              <select
                value={validMetric}
                onChange={(e) => onMetricChange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              <option value="combined">Combined Activity</option>
              <option value="stories">Stories</option>
              <option value="meetings">Meetings</option>
            </select>
          )}
          <button
            onClick={() => setScale(scale === 'linear' ? 'log' : 'linear')}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            {scale === 'linear' ? 'Log Scale' : 'Linear Scale'}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dateLabel" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            scale={scale}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value, name) => {
              if (value === null || value === undefined) return ['', ''];
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              if (name === 'forecast') return [numValue.toFixed(0), 'Forecast'];
              return [numValue.toFixed(0), 'Actual'];
            }}
            labelFormatter={(label) => {
              const point = chartData.find(d => d.dateLabel === label);
              if (!point) return label;
              try {
                const dateObj = safeParseDate(point.date);
                return format(dateObj, 'MMM dd, yyyy');
              } catch (e) {
                return label;
              }
            }}
          />
          <Legend />
          
          {/* Historical data */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#14b8a6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Actual"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Forecast data (dotted line) */}
          {showForecast && (
            <Area
              type="monotone"
              dataKey={d => d.isForecast ? d.value : null}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={0.3}
              fill="url(#colorForecast)"
              name="Forecast"
              dot={false}
            />
          )}

          {/* Anomaly markers */}
          {showAnomalies && anomalies.map((anomaly, index) => (
            <Area
              key={`anomaly-${index}`}
              type="monotone"
              dataKey={d => d.date === anomaly.date && d.isAnomaly ? d.value : null}
              stroke={anomaly.anomalyType === 'spike' ? '#ef4444' : '#3b82f6'}
              strokeWidth={3}
              dot={{ r: 6, fill: anomaly.anomalyType === 'spike' ? '#ef4444' : '#3b82f6' }}
              name={anomaly.anomalyLabel}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {anomalies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Detected Anomalies:</p>
          <div className="flex flex-wrap gap-2">
            {anomalies.slice(0, 5).map((anomaly, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded ${
                  anomaly.anomalyType === 'spike'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {anomaly.dateLabel}: {anomaly.anomalyLabel}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

