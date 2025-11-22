// src/lib/anomalyDetection.js
/**
 * Anomaly Detection System
 * 
 * Statistical anomaly detection using 3σ (three sigma) deviation
 * Detects unusual spikes/dips in metrics
 */

/**
 * Calculate mean of an array
 * @param {Array<number>} values - Array of numbers
 * @returns {number} Mean value
 */
function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation
 * @param {Array<number>} values - Array of numbers
 * @returns {number} Standard deviation
 */
function standardDeviation(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Detect anomalies using 3-sigma rule
 * @param {Array<{date: string, value: number, timestamp?: Date}>} timeSeries - Time series data
 * @param {number} sigmaThreshold - Number of standard deviations (default 3)
 * @returns {Array<{date: string, value: number, isAnomaly: boolean, deviation: number, type: 'spike'|'dip'|null}>} Data with anomaly flags
 */
export function detectAnomalies(timeSeries, sigmaThreshold = 3) {
  if (timeSeries.length < 3) {
    return timeSeries.map(point => ({
      ...point,
      isAnomaly: false,
      deviation: 0,
      type: null,
    }));
  }

  const values = timeSeries.map(p => p.value);
  const avg = mean(values);
  const stdDev = standardDeviation(values);

  if (stdDev === 0) {
    // No variation, no anomalies
    return timeSeries.map(point => ({
      ...point,
      isAnomaly: false,
      deviation: 0,
      type: null,
    }));
  }

  const upperBound = avg + (sigmaThreshold * stdDev);
  const lowerBound = avg - (sigmaThreshold * stdDev);

  return timeSeries.map(point => {
    const isAnomaly = point.value > upperBound || point.value < lowerBound;
    const deviation = (point.value - avg) / stdDev;
    let type = null;

    if (isAnomaly) {
      type = point.value > upperBound ? 'spike' : 'dip';
    }

    return {
      ...point,
      isAnomaly,
      deviation,
      type,
    };
  });
}

/**
 * Detect anomalies with rolling window (more sensitive to recent changes)
 * @param {Array<{date: string, value: number}>} timeSeries - Time series data
 * @param {number} windowSize - Size of rolling window (default 14 days)
 * @param {number} sigmaThreshold - Sigma threshold (default 3)
 * @returns {Array} Data with anomaly flags
 */
export function detectAnomaliesRolling(timeSeries, windowSize = 14, sigmaThreshold = 3) {
  if (timeSeries.length < windowSize + 1) {
    return detectAnomalies(timeSeries, sigmaThreshold);
  }

  const result = [];

  for (let i = 0; i < timeSeries.length; i++) {
    const windowStart = Math.max(0, i - windowSize);
    const window = timeSeries.slice(windowStart, i + 1);
    const windowValues = window.map(p => p.value);

    const avg = mean(windowValues);
    const stdDev = standardDeviation(windowValues);

    const point = timeSeries[i];
    let isAnomaly = false;
    let type = null;
    let deviation = 0;

    if (stdDev > 0) {
      const upperBound = avg + (sigmaThreshold * stdDev);
      const lowerBound = avg - (sigmaThreshold * stdDev);
      isAnomaly = point.value > upperBound || point.value < lowerBound;
      deviation = (point.value - avg) / stdDev;

      if (isAnomaly) {
        type = point.value > upperBound ? 'spike' : 'dip';
      }
    }

    result.push({
      ...point,
      isAnomaly,
      deviation,
      type,
    });
  }

  return result;
}

/**
 * Get anomaly summary statistics
 * @param {Array} anomalyData - Data with anomaly flags
 * @returns {object} Anomaly statistics
 */
export function getAnomalyStats(anomalyData) {
  const anomalies = anomalyData.filter(p => p.isAnomaly);
  const spikes = anomalies.filter(p => p.type === 'spike');
  const dips = anomalies.filter(p => p.type === 'dip');

  return {
    total: anomalies.length,
    spikes: spikes.length,
    dips: dips.length,
    rate: anomalyData.length > 0 ? (anomalies.length / anomalyData.length) * 100 : 0,
    recentAnomalies: anomalies.slice(-5).reverse(), // Last 5 anomalies
  };
}

/**
 * Highlight anomalies in time series data
 * @param {Array<{date: string, value: number}>} timeSeries - Time series data
 * @param {object} options - Detection options
 * @returns {Array} Data with anomaly information
 */
export function highlightAnomalies(timeSeries, options = {}) {
  const {
    method = 'rolling',
    windowSize = 14,
    sigmaThreshold = 3,
  } = options;

  if (method === 'rolling') {
    return detectAnomaliesRolling(timeSeries, windowSize, sigmaThreshold);
  } else {
    return detectAnomalies(timeSeries, sigmaThreshold);
  }
}

/**
 * Format anomaly label for display
 * @param {object} anomaly - Anomaly data point
 * @returns {string} Formatted label
 */
export function formatAnomalyLabel(anomaly) {
  if (!anomaly.isAnomaly) return '';

  const deviation = Math.abs(anomaly.deviation).toFixed(1);
  const type = anomaly.type === 'spike' ? 'Unusual spike' : 'Unusual dip';
  return `${type} detected (${deviation}σ deviation)`;
}

