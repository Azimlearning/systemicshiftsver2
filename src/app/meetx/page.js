// src/app/meetx/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import MeetingList from '../../components/MeetX/MeetingList';
import MeetingEditor from '../../components/MeetX/MeetingEditor';
import MeetingViewer from '../../components/MeetX/MeetingViewer';

export default function MeetXPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || isNavigating) return;
    
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      setIsNavigating(true);
      router.push('/login?redirect=/meetx');
      return;
    }

    fetchMeetings();
  }, [router, isNavigating]);

  const fetchMeetings = async (retryCount = 0) => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      if (retryCount < 2) {
        // Retry after 1 second
        setTimeout(() => fetchMeetings(retryCount + 1), 1000);
      } else {
        setError('Failed to load meetings. Please refresh the page.');
        setLoading(false);
      }
    }
  };

  // Calculate AI insights stats
  const meetingsWithInsights = meetings.filter(m => m.summary || m.aiInsights);
  const totalActionItems = meetings.reduce((sum, m) => {
    return sum + (m.aiInsights?.actionItems?.length || 0);
  }, 0);
  const totalWarnings = meetings.reduce((sum, m) => {
    return sum + (m.aiInsights?.alignmentWarnings?.length || 0);
  }, 0);
  const totalZombieTasks = meetings.reduce((sum, m) => {
    return sum + (m.aiInsights?.zombieTasks?.length || 0);
  }, 0);

  const handleCreateMeeting = () => {
    setViewMode('create');
    setSelectedMeeting(null);
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setViewMode('edit');
  };

  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setViewMode('view');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMeeting(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading && meetings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {viewMode === 'list' && (
        <>
          {/* AI Insights Stats */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <div className="text-2xl font-bold text-teal-700">{meetingsWithInsights.length}</div>
                <div className="text-sm text-teal-600">Meetings Analyzed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{totalActionItems}</div>
                <div className="text-sm text-blue-600">Action Items</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{totalWarnings}</div>
                <div className="text-sm text-yellow-600">Alignment Warnings</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-700">{totalZombieTasks}</div>
                <div className="text-sm text-red-600">Zombie Tasks</div>
              </div>
            </div>
          </div>
          
          <MeetingList
            onCreateMeeting={handleCreateMeeting}
            onViewMeeting={handleViewMeeting}
            onEditMeeting={handleEditMeeting}
          />
        </>
      )}
      
      {viewMode === 'create' && (
        <MeetingEditor
          onSave={handleBackToList}
          onCancel={handleBackToList}
        />
      )}
      
      {viewMode === 'edit' && selectedMeeting && (
        <MeetingEditor
          meeting={selectedMeeting}
          onSave={handleBackToList}
          onCancel={handleBackToList}
        />
      )}
      
      {viewMode === 'view' && selectedMeeting && (
        <MeetingViewer
          meeting={selectedMeeting}
          onEdit={() => handleEditMeeting(selectedMeeting)}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}
