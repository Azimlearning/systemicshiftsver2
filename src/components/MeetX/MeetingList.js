// src/components/MeetX/MeetingList.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';

export default function MeetingList({ onCreateMeeting, onViewMeeting, onEditMeeting, defaultFilter = 'all' }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(defaultFilter); // 'all', 'my', 'shared', 'public'

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = 'admin'; // For now, using simple user ID
      let q;

      if (filter === 'my') {
        q = query(
          collection(db, 'meetings'),
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else if (filter === 'shared') {
        q = query(
          collection(db, 'meetings'),
          where('sharedWith', 'array-contains', userId),
          orderBy('createdAt', 'desc')
        );
      } else if (filter === 'public') {
        q = query(
          collection(db, 'meetings'),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Get all meetings user can see
        const [myMeetings, sharedMeetings, publicMeetings] = await Promise.all([
          getDocs(query(collection(db, 'meetings'), where('createdBy', '==', userId), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'meetings'), where('sharedWith', 'array-contains', userId), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'meetings'), where('isPublic', '==', true), orderBy('createdAt', 'desc')))
        ]);

        const allMeetings = [];
        const meetingIds = new Set();

        [...myMeetings.docs, ...sharedMeetings.docs, ...publicMeetings.docs].forEach(doc => {
          if (!meetingIds.has(doc.id)) {
            meetingIds.add(doc.id);
            allMeetings.push({ id: doc.id, ...doc.data() });
          }
        });

        setMeetings(allMeetings.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        }));
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(q);
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsData);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'meetings', id));
      fetchMeetings();
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert('Failed to delete meeting');
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      meeting.title?.toLowerCase().includes(searchLower) ||
      meeting.content?.toLowerCase().includes(searchLower) ||
      meeting.summary?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
      {/* Header with Create Button and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        <button
          onClick={onCreateMeeting}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold whitespace-nowrap"
        >
          <FaPlus /> Create Meeting
        </button>
      </div>


      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading meetings...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-12">
          <FaFileAlt className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600 text-lg">No meetings found</p>
          <button
            onClick={onCreateMeeting}
            className="mt-4 text-teal-600 hover:text-teal-700 font-semibold"
          >
            Create your first meeting
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{meeting.title || 'Untitled Meeting'}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(meeting.createdAt)}
                    {meeting.fileType && (
                      <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                        {meeting.fileType.toUpperCase()}
                      </span>
                    )}
                  </p>
                  {meeting.summary && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{meeting.summary}</p>
                  )}
                  {meeting.aiInsights && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {meeting.aiInsights.actionItems && meeting.aiInsights.actionItems.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {meeting.aiInsights.actionItems.length} Actions
                        </span>
                      )}
                      {meeting.aiInsights.alignmentWarnings && meeting.aiInsights.alignmentWarnings.length > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          {meeting.aiInsights.alignmentWarnings.length} Warnings
                        </span>
                      )}
                      {meeting.aiInsights.zombieTasks && meeting.aiInsights.zombieTasks.length > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {meeting.aiInsights.zombieTasks.length} Zombie Tasks
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onViewMeeting(meeting)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <FaEye />
                  </button>
                  {meeting.createdBy === 'admin' && (
                    <>
                      <button
                        onClick={() => onEditMeeting(meeting)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

