// src/lib/generateFakeData.js
/**
 * Fake Data Generation Utility
 * 
 * Generates realistic fake data for all collections
 * Configurable date ranges and volumes
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { subDays, format, addDays } from 'date-fns';

const KEY_SHIFTS = [
  'Portfolio High-Grading',
  'Deliver Advantaged Barrels',
  'Operational Excellence',
  'Digital Transformation',
  'Sustainability',
];

const FOCUS_AREAS = [
  'Exploration',
  'Development',
  'Production',
  'Technology',
  'Safety',
  'Environment',
];

const KNOWLEDGE_CATEGORIES = [
  'strategic-planning',
  'operational-excellence',
  'digital-transformation',
  'sustainability',
  'technology',
];

const GALLERY_CATEGORIES = [
  'Stock Images',
  'Events',
  'Team Photos',
  'Infographics',
  'Operations',
  'Facilities',
];

/**
 * Generate fake stories
 * @param {number} count - Number of stories to generate
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function generateFakeStories(count, startDate, endDate) {
  const stories = [];
  const timeRange = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    const randomTime = startDate.getTime() + Math.random() * timeRange;
    const submittedAt = new Date(randomTime);

    const numKeyShifts = Math.floor(Math.random() * 3) + 1;
    const numFocusAreas = Math.floor(Math.random() * 3) + 1;

    const story = {
      title: `Story ${i + 1}: ${KEY_SHIFTS[Math.floor(Math.random() * KEY_SHIFTS.length)]} Initiative`,
      description: `This is a generated story about ${FOCUS_AREAS[Math.floor(Math.random() * FOCUS_AREAS.length)]} activities.`,
      keyShifts: Array.from({ length: numKeyShifts }, () =>
        KEY_SHIFTS[Math.floor(Math.random() * KEY_SHIFTS.length)]
      ),
      focusAreas: Array.from({ length: numFocusAreas }, () =>
        FOCUS_AREAS[Math.floor(Math.random() * FOCUS_AREAS.length)]
      ),
      desiredMindset: ['Growth Mindset', 'Commercial Savvy'][Math.floor(Math.random() * 2)],
      alignsWithShifts: Math.random() > 0.3,
      submittedAt: Timestamp.fromDate(submittedAt),
      writeUpURL: '',
      visualURLs: [],
    };

    stories.push(story);
  }

  // Add to Firestore
  const batch = [];
  for (const story of stories) {
    try {
      await addDoc(collection(db, 'stories'), story);
      batch.push(story);
    } catch (error) {
      console.error('Error adding fake story:', error);
    }
  }

  return batch.length;
}

/**
 * Generate fake meetings
 * @param {number} count - Number of meetings to generate
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function generateFakeMeetings(count, startDate, endDate) {
  const meetings = [];
  const timeRange = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    const randomTime = startDate.getTime() + Math.random() * timeRange;
    const createdAt = new Date(randomTime);

    const hasAIInsights = Math.random() > 0.3; // 70% have AI insights
    const numActionItems = Math.floor(Math.random() * 5) + 1;

    const meeting = {
      title: `Meeting ${i + 1}: ${FOCUS_AREAS[Math.floor(Math.random() * FOCUS_AREAS.length)]} Review`,
      notes: `Generated meeting notes for discussion about ${KEY_SHIFTS[Math.floor(Math.random() * KEY_SHIFTS.length)]}.`,
      createdAt: Timestamp.fromDate(createdAt),
      createdBy: 'admin',
      sharedWith: [],
      isPublic: Math.random() > 0.7,
      summary: hasAIInsights ? `Summary of meeting ${i + 1} with key discussion points.` : null,
      aiInsights: hasAIInsights
        ? {
            actionItems: Array.from({ length: numActionItems }, (_, idx) => ({
              item: `Action item ${idx + 1}`,
              assignee: `Team Member ${idx + 1}`,
              dueDate: format(addDays(createdAt, Math.floor(Math.random() * 30) + 7), 'yyyy-MM-dd'),
            })),
            alignmentWarnings: Math.random() > 0.8 ? ['Potential misalignment detected'] : [],
            zombieTasks: [],
          }
        : null,
    };

    meetings.push(meeting);
  }

  // Add to Firestore
  const batch = [];
  for (const meeting of meetings) {
    try {
      await addDoc(collection(db, 'meetings'), meeting);
      batch.push(meeting);
    } catch (error) {
      console.error('Error adding fake meeting:', error);
    }
  }

  return batch.length;
}

/**
 * Generate fake analytics events
 * @param {number} count - Number of events to generate
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function generateFakeAnalytics(count, startDate, endDate) {
  const events = [];
  const timeRange = endDate.getTime() - startDate.getTime();
  const pages = ['/', '/statsx', '/meetx', '/nexushub', '/articles', '/systemic-shifts/upstream-target'];

  for (let i = 0; i < count; i++) {
    const randomTime = startDate.getTime() + Math.random() * timeRange;
    const timestamp = new Date(randomTime);

    const event = {
      type: Math.random() > 0.5 ? 'page_view' : 'event',
      pagePath: pages[Math.floor(Math.random() * pages.length)],
      pageTitle: `Page ${i + 1}`,
      userId: `user_${Math.floor(Math.random() * 10)}`,
      timestamp: Timestamp.fromDate(timestamp),
      eventName: Math.random() > 0.5 ? 'button_click' : 'link_click',
      elementId: `element_${i}`,
      metadata: {},
    };

    events.push(event);
  }

  // Add to Firestore
  const batch = [];
  for (const event of events) {
    try {
      await addDoc(collection(db, 'analytics'), event);
      batch.push(event);
    } catch (error) {
      console.error('Error adding fake analytics event:', error);
    }
  }

  return batch.length;
}

/**
 * Data Scenarios for Presentation/Testing
 */
export const DATA_SCENARIOS = {
  highEngagement: {
    name: 'High Engagement',
    description: 'High user activity, many stories, meetings, and analytics events',
    config: {
      storiesCount: 100,
      meetingsCount: 60,
      analyticsCount: 500,
      daysBack: 60,
      engagementMultiplier: 2.5,
    }
  },
  lowEngagement: {
    name: 'Low Engagement',
    description: 'Low user activity, few stories and meetings',
    config: {
      storiesCount: 10,
      meetingsCount: 5,
      analyticsCount: 50,
      daysBack: 30,
      engagementMultiplier: 0.3,
    }
  },
  anomalies: {
    name: 'Anomalies Detected',
    description: 'Data with anomalies and unusual patterns for testing detection',
    config: {
      storiesCount: 75,
      meetingsCount: 40,
      analyticsCount: 300,
      daysBack: 45,
      engagementMultiplier: 1.5,
      includeAnomalies: true,
    }
  },
  normal: {
    name: 'Normal Activity',
    description: 'Standard activity levels for typical usage',
    config: {
      storiesCount: 50,
      meetingsCount: 30,
      analyticsCount: 200,
      daysBack: 30,
      engagementMultiplier: 1.0,
    }
  },
  presentation: {
    name: 'Presentation Mode',
    description: 'Optimized data for presentations with clear trends',
    config: {
      storiesCount: 80,
      meetingsCount: 50,
      analyticsCount: 400,
      daysBack: 90,
      engagementMultiplier: 1.8,
      clearTrends: true,
    }
  }
};

/**
 * Generate fake article engagement data for a scenario
 * @param {string} scenario - Scenario name
 * @param {number} articleCount - Number of articles
 */
export async function generateArticleEngagementForScenario(scenario, articleCount = 20) {
  const scenarioConfig = DATA_SCENARIOS[scenario]?.config || DATA_SCENARIOS.normal.config;
  const multiplier = scenarioConfig.engagementMultiplier || 1.0;
  
  const categories = ['systemic-shifts', 'jukris-lens', 'upstreambuzz', 'petronas-2.0', 'trending'];
  
  for (let i = 1; i <= articleCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const baseViews = Math.floor(Math.random() * 100) + 10;
    const baseLikes = Math.floor(baseViews * 0.1);
    const baseComments = Math.floor(baseViews * 0.05);
    
    // Apply scenario multiplier
    const views = Math.floor(baseViews * multiplier);
    const likes = Math.floor(baseLikes * multiplier);
    const comments = Math.floor(baseComments * multiplier);
    
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const articleEngagementRef = doc(db, 'articleEngagement', String(i));
      await setDoc(articleEngagementRef, {
        articleId: String(i),
        articleTitle: `Article ${i}`,
        category: category,
        views: views,
        likes: likes,
        comments: comments,
        createdAt: Timestamp.now(),
        lastViewedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error generating engagement for article ${i}:`, error);
    }
  }
}

/**
 * Generate all fake data with scenario support
 * @param {string} scenario - Scenario name (highEngagement, lowEngagement, anomalies, normal, presentation)
 * @param {object} customOptions - Custom options to override scenario defaults
 * @returns {Promise<object>} Generation results
 */
export async function generateAllFakeData(scenario = 'normal', customOptions = {}) {
  const scenarioConfig = DATA_SCENARIOS[scenario]?.config || DATA_SCENARIOS.normal.config;
  const options = {
    ...scenarioConfig,
    ...customOptions,
  };

  const {
    storiesCount = 50,
    meetingsCount = 30,
    analyticsCount = 200,
    daysBack = 30,
    engagementMultiplier = 1.0,
    includeAnomalies = false,
    clearTrends = false,
  } = options;

  const endDate = new Date();
  const startDate = subDays(endDate, daysBack);

  const results = {
    scenario: scenario,
    stories: 0,
    meetings: 0,
    analytics: 0,
    articleEngagement: 0,
    errors: [],
  };

  console.log(`Generating data for scenario: ${scenario} (${DATA_SCENARIOS[scenario]?.name || 'Unknown'})`);

  try {
    // Generate stories with scenario-specific patterns
    if (includeAnomalies) {
      // Add some stories with unusual patterns
      const anomalyCount = Math.floor(storiesCount * 0.1);
      results.stories = await generateFakeStories(storiesCount - anomalyCount, startDate, endDate);
      // Add anomalies (stories with very old dates or future dates)
      const anomalyStart = subDays(endDate, daysBack * 2);
      const anomalyEnd = addDays(endDate, 7);
      await generateFakeStories(anomalyCount, anomalyStart, anomalyEnd);
      results.stories += anomalyCount;
    } else {
      results.stories = await generateFakeStories(storiesCount, startDate, endDate);
    }
  } catch (error) {
    results.errors.push(`Stories: ${error.message}`);
  }

  try {
    results.meetings = await generateFakeMeetings(meetingsCount, startDate, endDate);
  } catch (error) {
    results.errors.push(`Meetings: ${error.message}`);
  }

  try {
    // Generate analytics with engagement multiplier
    const adjustedAnalyticsCount = Math.floor(analyticsCount * engagementMultiplier);
    results.analytics = await generateFakeAnalytics(adjustedAnalyticsCount, startDate, endDate);
  } catch (error) {
    results.errors.push(`Analytics: ${error.message}`);
  }

  try {
    // Generate article engagement data
    results.articleEngagement = await generateArticleEngagementForScenario(scenario, 20);
  } catch (error) {
    results.errors.push(`Article Engagement: ${error.message}`);
  }

  return results;
}

/**
 * Clear all generated test data
 * WARNING: This will delete all data in the specified collections
 * @param {Array<string>} collections - Collections to clear (default: all test collections)
 */
export async function clearTestData(collections = ['stories', 'meetings', 'analytics', 'articleEngagement', 'articleLikes', 'articleComments']) {
  const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
  
  const results = {
    cleared: {},
    errors: [],
  };

  for (const collName of collections) {
    try {
      const collRef = collection(db, collName);
      const snapshot = await getDocs(collRef);
      let deleted = 0;
      
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
        deleted++;
      }
      
      results.cleared[collName] = deleted;
      console.log(`Cleared ${deleted} documents from ${collName}`);
    } catch (error) {
      results.errors.push(`${collName}: ${error.message}`);
    }
  }

  return results;
}

// Export scenarios for use in other modules
export { DATA_SCENARIOS };
