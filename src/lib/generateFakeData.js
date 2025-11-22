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
 * Generate all fake data
 * @param {object} options - Generation options
 * @returns {Promise<object>} Generation results
 */
export async function generateAllFakeData(options = {}) {
  const {
    storiesCount = 50,
    meetingsCount = 30,
    analyticsCount = 200,
    daysBack = 30,
  } = options;

  const endDate = new Date();
  const startDate = subDays(endDate, daysBack);

  const results = {
    stories: 0,
    meetings: 0,
    analytics: 0,
    errors: [],
  };

  try {
    results.stories = await generateFakeStories(storiesCount, startDate, endDate);
  } catch (error) {
    results.errors.push(`Stories: ${error.message}`);
  }

  try {
    results.meetings = await generateFakeMeetings(meetingsCount, startDate, endDate);
  } catch (error) {
    results.errors.push(`Meetings: ${error.message}`);
  }

  try {
    results.analytics = await generateFakeAnalytics(analyticsCount, startDate, endDate);
  } catch (error) {
    results.errors.push(`Analytics: ${error.message}`);
  }

  return results;
}

