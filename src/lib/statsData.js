// src/lib/statsData.js
/**
 * Data Aggregation Utilities
 * 
 * Functions to aggregate data from all Firestore collections
 * Time-series data processing and statistical calculations
 */

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  format,
  parseISO,
  isWithinInterval
} from 'date-fns';

/**
 * Aggregate stories data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<object>} Aggregated stories data
 */
export async function aggregateStories(startDate, endDate) {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(
      storiesRef,
      where('submittedAt', '>=', Timestamp.fromDate(startDate)),
      where('submittedAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Time series data (daily)
    const dailyData = {};
    const keyShiftsCount = {};
    const focusAreasCount = {};

    stories.forEach(story => {
      const date = story.submittedAt?.toDate();
      if (date) {
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;

        // Count key shifts
        if (story.keyShifts && Array.isArray(story.keyShifts)) {
          story.keyShifts.forEach(shift => {
            keyShiftsCount[shift] = (keyShiftsCount[shift] || 0) + 1;
          });
        }

        // Count focus areas
        if (story.focusAreas && Array.isArray(story.focusAreas)) {
          story.focusAreas.forEach(area => {
            focusAreasCount[area] = (focusAreasCount[area] || 0) + 1;
          });
        }
      }
    });

    // Convert to time series array
    const timeSeries = Object.entries(dailyData)
      .map(([date, count]) => ({
        date,
        value: count,
        timestamp: parseISO(date),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      total: stories.length,
      timeSeries,
      keyShiftsCount,
      focusAreasCount,
      averagePerDay: stories.length / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
    };
  } catch (error) {
    console.error('Error aggregating stories:', error);
    return {
      total: 0,
      timeSeries: [],
      keyShiftsCount: {},
      focusAreasCount: {},
      averagePerDay: 0,
    };
  }
}

/**
 * Aggregate meetings data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<object>} Aggregated meetings data
 */
export async function aggregateMeetings(startDate, endDate) {
  try {
    const meetingsRef = collection(db, 'meetings');
    const q = query(
      meetingsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const meetings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Time series data (daily)
    const dailyData = {};
    let totalActionItems = 0;
    let totalInsights = 0;
    let meetingsWithAI = 0;

    meetings.forEach(meeting => {
      const date = meeting.createdAt?.toDate();
      if (date) {
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
      }

      // Count action items
      if (meeting.aiInsights?.actionItems) {
        totalActionItems += meeting.aiInsights.actionItems.length;
      }

      // Count AI insights
      if (meeting.aiInsights || meeting.summary) {
        totalInsights++;
        meetingsWithAI++;
      }
    });

    const timeSeries = Object.entries(dailyData)
      .map(([date, count]) => ({
        date,
        value: count,
        timestamp: parseISO(date),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      total: meetings.length,
      timeSeries,
      totalActionItems,
      totalInsights,
      meetingsWithAI,
      aiUsageRate: meetings.length > 0 ? (meetingsWithAI / meetings.length) * 100 : 0,
      averagePerDay: meetings.length / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
    };
  } catch (error) {
    console.error('Error aggregating meetings:', error);
    return {
      total: 0,
      timeSeries: [],
      totalActionItems: 0,
      totalInsights: 0,
      meetingsWithAI: 0,
      aiUsageRate: 0,
      averagePerDay: 0,
    };
  }
}

/**
 * Aggregate knowledge base data
 * @param {Date} startDate - Start date (optional, for access tracking)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<object>} Aggregated knowledge base data
 */
export async function aggregateKnowledgeBase(startDate = null, endDate = null) {
  try {
    const kbRef = collection(db, 'knowledgeBase');
    const snapshot = await getDocs(kbRef);
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const categoryCount = {};
    const tagCount = {};

    documents.forEach(doc => {
      // Count categories
      if (doc.category) {
        categoryCount[doc.category] = (categoryCount[doc.category] || 0) + 1;
      }

      // Count tags
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    return {
      total: documents.length,
      categoryCount,
      tagCount,
      topCategories: Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      topTags: Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
    };
  } catch (error) {
    console.error('Error aggregating knowledge base:', error);
    return {
      total: 0,
      categoryCount: {},
      tagCount: {},
      topCategories: [],
      topTags: [],
    };
  }
}

/**
 * Aggregate gallery data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<object>} Aggregated gallery data
 */
export async function aggregateGallery(startDate, endDate) {
  try {
    const galleryRef = collection(db, 'upstreamGallery');
    const q = query(
      galleryRef,
      where('uploadedAt', '>=', Timestamp.fromDate(startDate)),
      where('uploadedAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const dailyData = {};
    const categoryCount = {};

    images.forEach(image => {
      const date = image.uploadedAt?.toDate();
      if (date) {
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
      }

      if (image.category) {
        categoryCount[image.category] = (categoryCount[image.category] || 0) + 1;
      }
    });

    const timeSeries = Object.entries(dailyData)
      .map(([date, count]) => ({
        date,
        value: count,
        timestamp: parseISO(date),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      total: images.length,
      timeSeries,
      categoryCount,
      averagePerDay: images.length / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
    };
  } catch (error) {
    console.error('Error aggregating gallery:', error);
    return {
      total: 0,
      timeSeries: [],
      categoryCount: {},
      averagePerDay: 0,
    };
  }
}

/**
 * Calculate week-over-week growth
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous period value
 * @returns {number} Growth percentage
 */
export function calculateGrowth(currentValue, previousValue) {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Get comparison data (current period vs previous period)
 * @param {Function} aggregateFunction - Function to aggregate data
 * @param {Date} startDate - Start date of current period
 * @param {Date} endDate - End date of current period
 * @returns {Promise<object>} Comparison data with growth metrics
 */
export async function getComparisonData(aggregateFunction, startDate, endDate) {
  const periodLength = endDate - startDate;
  const previousStartDate = new Date(startDate.getTime() - periodLength);
  const previousEndDate = startDate;

  const [current, previous] = await Promise.all([
    aggregateFunction(startDate, endDate),
    aggregateFunction(previousStartDate, previousEndDate),
  ]);

  return {
    current,
    previous,
    growth: calculateGrowth(current.total, previous.total),
  };
}

/**
 * Get all aggregated data for dashboard
 * @param {Date} startDate - Start date (defaults to 30 days ago)
 * @param {Date} endDate - End date (defaults to now)
 * @returns {Promise<object>} All aggregated dashboard data
 */
export async function getAllDashboardData(startDate = null, endDate = null) {
  const now = new Date();
  const defaultStartDate = startDate || subDays(now, 30);
  const defaultEndDate = endDate || now;

  const [stories, meetings, knowledgeBase, gallery] = await Promise.all([
    aggregateStories(defaultStartDate, defaultEndDate),
    aggregateMeetings(defaultStartDate, defaultEndDate),
    aggregateKnowledgeBase(defaultStartDate, defaultEndDate),
    aggregateGallery(defaultStartDate, defaultEndDate),
  ]);

  // Get week-over-week comparisons
  const weekAgo = subWeeks(now, 1);
  const [storiesComparison, meetingsComparison] = await Promise.all([
    getComparisonData(aggregateStories, weekAgo, now),
    getComparisonData(aggregateMeetings, weekAgo, now),
  ]);

  return {
    stories,
    meetings,
    knowledgeBase,
    gallery,
    comparisons: {
      stories: storiesComparison,
      meetings: meetingsComparison,
    },
    dateRange: {
      start: defaultStartDate,
      end: defaultEndDate,
    },
  };
}

