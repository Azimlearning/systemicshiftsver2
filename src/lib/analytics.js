// src/lib/analytics.js
/**
 * Analytics Tracking System
 * 
 * Tracks page views, user interactions, and click events
 * Stores events in Firestore 'analytics' collection
 */

import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment 
} from 'firebase/firestore';

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

/**
 * Track article view
 * @param {string|number} articleId - The ID of the article
 * @param {string} articleTitle - The title of the article
 * @param {string} category - The category of the article
 */
export async function trackArticleView(articleId, articleTitle, category) {
  try {
    const userId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous';

    // Track in analytics collection
    await addDoc(collection(db, 'analytics'), {
      type: 'article_view',
      articleId: String(articleId),
      articleTitle,
      category,
      userId,
      timestamp: serverTimestamp(),
    });

    // Update article engagement document
    const articleEngagementRef = doc(db, 'articleEngagement', String(articleId));
    const articleEngagementSnap = await getDoc(articleEngagementRef);
    
    if (articleEngagementSnap.exists()) {
      // Increment view count
      await updateDoc(articleEngagementRef, {
        views: increment(1),
        lastViewedAt: serverTimestamp(),
      });
    } else {
      // Create new engagement document
      await setDoc(articleEngagementRef, {
        articleId: String(articleId),
        articleTitle,
        category,
        views: 1,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        lastViewedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
}

/**
 * Toggle article like
 * @param {string|number} articleId - The ID of the article
 * @param {string} userId - The user ID (optional, will use session if not provided)
 * @returns {Promise<{liked: boolean, totalLikes: number}>} Current like status and total likes
 */
export async function toggleArticleLike(articleId, userId = null) {
  try {
    const currentUserId = userId || (typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous');

    const articleIdStr = String(articleId);
    const articleEngagementRef = doc(db, 'articleEngagement', articleIdStr);
    const userLikeRef = doc(db, 'articleLikes', `${articleIdStr}_${currentUserId}`);

    // Check if user already liked
    const userLikeSnap = await getDoc(userLikeRef);
    const isLiked = userLikeSnap.exists();

    if (isLiked) {
      // Unlike: remove like document and decrement count
      await deleteDoc(userLikeRef);
      await updateDoc(articleEngagementRef, {
        likes: increment(-1),
      });
      
      const engagementSnap = await getDoc(articleEngagementRef);
      return {
        liked: false,
        totalLikes: engagementSnap.data()?.likes || 0,
      };
    } else {
      // Like: create like document and increment count
      await setDoc(userLikeRef, {
        articleId: articleIdStr,
        userId: currentUserId,
        timestamp: serverTimestamp(),
      });
      
      const engagementSnap = await getDoc(articleEngagementRef);
      if (engagementSnap.exists()) {
        await updateDoc(articleEngagementRef, {
          likes: increment(1),
        });
      } else {
        await setDoc(articleEngagementRef, {
          articleId: articleIdStr,
          views: 0,
          likes: 1,
          comments: 0,
          createdAt: serverTimestamp(),
        });
      }
      
      const updatedSnap = await getDoc(articleEngagementRef);
      return {
        liked: true,
        totalLikes: updatedSnap.data()?.likes || 1,
      };
    }
  } catch (error) {
    console.error('Error toggling article like:', error);
    throw error;
  }
}

/**
 * Check if user has liked an article
 * @param {string|number} articleId - The ID of the article
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<boolean>} Whether the user has liked the article
 */
export async function checkArticleLike(articleId, userId = null) {
  try {
    const currentUserId = userId || (typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous');

    const userLikeRef = doc(db, 'articleLikes', `${String(articleId)}_${currentUserId}`);
    const userLikeSnap = await getDoc(userLikeRef);
    return userLikeSnap.exists();
  } catch (error) {
    console.error('Error checking article like:', error);
    return false;
  }
}

/**
 * Add a comment to an article
 * @param {string|number} articleId - The ID of the article
 * @param {string} commentText - The comment text
 * @param {string} userName - The name of the user (optional)
 * @returns {Promise<object>} The created comment
 */
export async function addArticleComment(articleId, commentText, userName = null) {
  try {
    const userId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('userId') || 'anonymous' 
      : 'anonymous';

    const articleIdStr = String(articleId);
    
    // Add comment to comments collection
    const commentRef = await addDoc(collection(db, 'articleComments'), {
      articleId: articleIdStr,
      userId,
      userName: userName || 'Anonymous',
      commentText,
      timestamp: serverTimestamp(),
    });

    // Increment comment count in engagement document
    const articleEngagementRef = doc(db, 'articleEngagement', articleIdStr);
    const engagementSnap = await getDoc(articleEngagementRef);
    
    if (engagementSnap.exists()) {
      await updateDoc(articleEngagementRef, {
        comments: increment(1),
      });
    } else {
      await setDoc(articleEngagementRef, {
        articleId: articleIdStr,
        views: 0,
        likes: 0,
        comments: 1,
        createdAt: serverTimestamp(),
      });
    }

    const commentSnap = await getDoc(commentRef);
    return {
      id: commentRef.id,
      ...commentSnap.data(),
    };
  } catch (error) {
    console.error('Error adding article comment:', error);
    throw error;
  }
}

/**
 * Get article engagement data
 * @param {string|number} articleId - The ID of the article
 * @returns {Promise<object>} Engagement data (views, likes, comments)
 */
export async function getArticleEngagement(articleId) {
  try {
    const articleEngagementRef = doc(db, 'articleEngagement', String(articleId));
    const engagementSnap = await getDoc(articleEngagementRef);
    
    if (engagementSnap.exists()) {
      return {
        articleId: String(articleId),
        views: engagementSnap.data().views || 0,
        likes: engagementSnap.data().likes || 0,
        comments: engagementSnap.data().comments || 0,
        ...engagementSnap.data(),
      };
    }
    
    return {
      articleId: String(articleId),
      views: 0,
      likes: 0,
      comments: 0,
    };
  } catch (error) {
    console.error('Error getting article engagement:', error);
    return {
      articleId: String(articleId),
      views: 0,
      likes: 0,
      comments: 0,
    };
  }
}

/**
 * Get all article engagement data
 * @returns {Promise<Array>} Array of engagement data for all articles
 */
export async function getAllArticleEngagement() {
  try {
    const snapshot = await getDocs(collection(db, 'articleEngagement'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting all article engagement:', error);
    return [];
  }
}

/**
 * Get article comments
 * @param {string|number} articleId - The ID of the article
 * @param {number} limitCount - Maximum number of comments to return
 * @returns {Promise<Array>} Array of comments
 */
export async function getArticleComments(articleId, limitCount = 50) {
  try {
    const q = query(
      collection(db, 'articleComments'),
      where('articleId', '==', String(articleId)),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting article comments:', error);
    return [];
  }
}

