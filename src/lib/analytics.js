// src/lib/analytics.js
/**
 * Analytics Tracking System
 * 
 * Tracks page views, user interactions, and click events
 * Stores events in Firestore 'analytics' collection
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * Track a page view event
 * @param {string} pagePath - The path of the page viewed
 * @param {string} pageTitle - The title of the page
 * @param {object} metadata - Additional metadata (optional)
 */
export async function trackPageView(pagePath, pageTitle, metadata = {}) {
  try {
    const userId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous';

    await addDoc(collection(db, 'analytics'), {
      type: 'page_view',
      pagePath,
      pageTitle,
      userId,
      timestamp: serverTimestamp(),
      metadata,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof window !== 'undefined' ? document.referrer : '',
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Track a click/interaction event
 * @param {string} eventName - Name of the event (e.g., 'button_click', 'link_click')
 * @param {string} elementId - ID or identifier of the element
 * @param {object} metadata - Additional metadata (optional)
 */
export async function trackEvent(eventName, elementId, metadata = {}) {
  try {
    const userId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous';

    const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';

    await addDoc(collection(db, 'analytics'), {
      type: 'event',
      eventName,
      elementId,
      pagePath,
      userId,
      timestamp: serverTimestamp(),
      metadata,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track a custom analytics event
 * @param {string} eventType - Type of event
 * @param {object} data - Event data
 */
export async function trackCustomEvent(eventType, data = {}) {
  try {
    const userId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous';

    await addDoc(collection(db, 'analytics'), {
      type: eventType,
      userId,
      timestamp: serverTimestamp(),
      ...data,
    });
  } catch (error) {
    console.error('Error tracking custom event:', error);
  }
}

/**
 * Get analytics events for a specific time range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} eventType - Optional filter by event type
 * @returns {Promise<Array>} Array of analytics events
 */
export async function getAnalyticsEvents(startDate, endDate, eventType = null) {
  try {
    let q = query(
      collection(db, 'analytics'),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'desc')
    );

    if (eventType) {
      q = query(q, where('type', '==', eventType));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return [];
  }
}

/**
 * Get page view statistics
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<object>} Page view statistics
 */
export async function getPageViewStats(startDate, endDate) {
  try {
    const events = await getAnalyticsEvents(startDate, endDate, 'page_view');
    
    const pageViews = {};
    let totalViews = 0;

    events.forEach(event => {
      const path = event.pagePath || 'unknown';
      pageViews[path] = (pageViews[path] || 0) + 1;
      totalViews++;
    });

    return {
      totalViews,
      pageViews,
      uniquePages: Object.keys(pageViews).length,
    };
  } catch (error) {
    console.error('Error fetching page view stats:', error);
    return { totalViews: 0, pageViews: {}, uniquePages: 0 };
  }
}

/**
 * Initialize analytics tracking on page load
 * Call this in your main layout or app component
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  // Track initial page view
  trackPageView(window.location.pathname, document.title);

  // Track page views on navigation (for Next.js)
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    trackPageView(window.location.pathname, document.title);
  };

  window.addEventListener('popstate', () => {
    trackPageView(window.location.pathname, document.title);
  });
}

