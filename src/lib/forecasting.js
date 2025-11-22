// src/lib/forecasting.js
/**
 * Predictive Forecasting System
 * 
 * Time-series forecasting using linear regression
 * Predicts next 30 days based on historical data
 */

import { addDays, format, parseISO } from 'date-fns';

/**
 * Simple linear regression
 * @param {Array<{x: number, y: number}>} data - Data points
 * @returns {object} Regression coefficients {slope, intercept}
 */
function linearRegression(data) {
  const n = data.length;
  if (n < 2) {
    return { slope: 0, intercept: data[0]?.y || 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach(point => {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculate moving average
 * @param {Array<number>} values - Array of values
 * @param {number} window - Window size
 * @returns {Array<number>} Moving averages
 */
function movingAverage(values, window = 7) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

/**
 * Forecast future values using linear regression
 * @param {Array<{date: string, value: number}>} timeSeries - Historical time series data
 * @param {number} daysAhead - Number of days to forecast
 * @returns {Array<{date: string, value: number, isForecast: boolean}>} Forecasted data
 */
export function forecastLinear(timeSeries, daysAhead = 30) {
  if (timeSeries.length < 2) {
    // Not enough data, return flat forecast
    const lastValue = timeSeries[timeSeries.length - 1]?.value || 0;
    const lastDate = timeSeries[timeSeries.length - 1]?.timestamp 
      ? new Date(timeSeries[timeSeries.length - 1].timestamp)
      : new Date();

    const forecast = [];
    for (let i = 1; i <= daysAhead; i++) {
      forecast.push({
        date: format(addDays(lastDate, i), 'yyyy-MM-dd'),
        value: lastValue,
        isForecast: true,
      });
    }
    return forecast;
  }

  // Convert to regression format (x = day index, y = value)
  const regressionData = timeSeries.map((point, index) => ({
    x: index,
    y: point.value,
  }));

  const { slope, intercept } = linearRegression(regressionData);

  // Generate forecast
  const lastDate = timeSeries[timeSeries.length - 1]?.timestamp
    ? new Date(timeSeries[timeSeries.length - 1].timestamp)
    : new Date();

  const forecast = [];
  for (let i = 1; i <= daysAhead; i++) {
    const futureIndex = timeSeries.length + i - 1;
    const predictedValue = slope * futureIndex + intercept;
    forecast.push({
      date: format(addDays(lastDate, i), 'yyyy-MM-dd'),
      value: Math.max(0, predictedValue), // Ensure non-negative
      isForecast: true,
    });
  }

  return forecast;
}

/**
 * Forecast with trend smoothing (using moving average)
 * @param {Array<{date: string, value: number}>} timeSeries - Historical data
 * @param {number} daysAhead - Days to forecast
 * @param {number} smoothingWindow - Moving average window
 * @returns {Array<{date: string, value: number, isForecast: boolean}>} Forecasted data
 */
export function forecastSmooth(timeSeries, daysAhead = 30, smoothingWindow = 7) {
  if (timeSeries.length < smoothingWindow) {
    return forecastLinear(timeSeries, daysAhead);
  }

  // Apply moving average smoothing
  const values = timeSeries.map(p => p.value);
  const smoothed = movingAverage(values, smoothingWindow);

  // Use smoothed data for regression
  const smoothedSeries = timeSeries.map((point, index) => ({
    date: point.date,
    value: smoothed[index],
    timestamp: point.timestamp,
  }));

  return forecastLinear(smoothedSeries, daysAhead);
}

/**
 * Forecast with seasonal adjustment (simple)
 * @param {Array<{date: string, value: number}>} timeSeries - Historical data
 * @param {number} daysAhead - Days to forecast
 * @returns {Array<{date: string, value: number, isForecast: boolean}>} Forecasted data
 */
export function forecastSeasonal(timeSeries, daysAhead = 30) {
  if (timeSeries.length < 14) {
    return forecastLinear(timeSeries, daysAhead);
  }

  // Calculate weekly pattern (if we have enough data)
  const weeklyPattern = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];

  timeSeries.forEach(point => {
    if (point.timestamp) {
      const date = new Date(point.timestamp);
      const dayOfWeek = date.getDay();
      weeklyPattern[dayOfWeek] += point.value;
      weeklyCounts[dayOfWeek]++;
    }
  });

  // Average the pattern
  const avgWeeklyPattern = weeklyPattern.map((sum, i) => 
    weeklyCounts[i] > 0 ? sum / weeklyCounts[i] : 0
  );

  // Get overall average
  const overallAvg = timeSeries.reduce((sum, p) => sum + p.value, 0) / timeSeries.length;

  // Normalize pattern (relative to average)
  const normalizedPattern = avgWeeklyPattern.map(val => 
    overallAvg > 0 ? (val / overallAvg) : 1
  );

  // Forecast using linear regression
  const baseForecast = forecastLinear(timeSeries, daysAhead);

  // Apply seasonal adjustment
  const lastDate = timeSeries[timeSeries.length - 1]?.timestamp
    ? new Date(timeSeries[timeSeries.length - 1].timestamp)
    : new Date();

  return baseForecast.map((point, index) => {
    const forecastDate = parseISO(point.date);
    const dayOfWeek = forecastDate.getDay();
    const seasonalFactor = normalizedPattern[dayOfWeek] || 1;

    return {
      ...point,
      value: point.value * seasonalFactor,
    };
  });
}

/**
 * Combine historical and forecasted data
 * @param {Array<{date: string, value: number}>} historical - Historical data
 * @param {Array<{date: string, value: number, isForecast: boolean}>} forecast - Forecasted data
 * @returns {Array} Combined dataset
 */
export function combineHistoricalAndForecast(historical, forecast) {
  const historicalWithFlag = historical.map(point => ({
    ...point,
    isForecast: false,
  }));

  return [...historicalWithFlag, ...forecast];
}

/**
 * Main forecasting function - uses best available method
 * @param {Array<{date: string, value: number}>} timeSeries - Historical data
 * @param {number} daysAhead - Days to forecast (default 30)
 * @param {string} method - 'linear', 'smooth', or 'seasonal' (default 'smooth')
 * @returns {Array} Combined historical and forecasted data
 */
export function forecast(timeSeries, daysAhead = 30, method = 'smooth') {
  let forecastData;

  switch (method) {
    case 'linear':
      forecastData = forecastLinear(timeSeries, daysAhead);
      break;
    case 'seasonal':
      forecastData = forecastSeasonal(timeSeries, daysAhead);
      break;
    case 'smooth':
    default:
      forecastData = forecastSmooth(timeSeries, daysAhead);
      break;
  }

  return combineHistoricalAndForecast(timeSeries, forecastData);
}

