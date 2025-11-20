// src/app/meetx/insights/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import AIInsightsPanel from '../../../components/MeetX/AIInsightsPanel';
import { FaBrain, FaChartLine } from 'react-icons/fa';

export default function AIInsightsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      router.push('/login?redirect=/meetx/insights');
      return;
    }

    fetchMeetings();
  }, [router]);

  const fetchMeetings = async () => {
    try {
      const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      ) : meetingsWithInsights.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <FaChartLine className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600 text-lg">No AI insights available yet</p>
          <p className="text-sm text-gray-500 mt-2">Create meetings to generate insights</p>
        </div>
      ) : (
        <div className="space-y-6">
          {meetingsWithInsights.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{meeting.title || 'Untitled Meeting'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {meeting.createdAt?.toDate?.().toLocaleDateString() || 'No date'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMeeting(selectedMeeting?.id === meeting.id ? null : meeting)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  {selectedMeeting?.id === meeting.id ? 'Hide Insights' : 'View Insights'}
                </button>
              </div>
              {selectedMeeting?.id === meeting.id && (
                <AIInsightsPanel meeting={meeting} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

