// src/components/MeetX/MeetingViewer.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AIInsightsPanel from './AIInsightsPanel';
import { FaEdit, FaArrowLeft, FaDownload, FaShare } from 'react-icons/fa';

export default function MeetingViewer({ meeting, onEdit, onBack }) {
  const [fullMeeting, setFullMeeting] = useState(meeting);
  const [loading, setLoading] = useState(!meeting);

  useEffect(() => {
    if (meeting?.id && !meeting.content) {
      // Fetch full meeting data if not provided
      const fetchMeeting = async () => {
        try {
          const docRef = doc(db, 'meetings', meeting.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFullMeeting({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching meeting:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMeeting();
    } else {
      setLoading(false);
    }
  }, [meeting]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    const content = `Title: ${fullMeeting.title}\n\nDate: ${formatDate(fullMeeting.createdAt)}\n\n${fullMeeting.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullMeeting.title || 'meeting'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="mt-4 text-gray-600">Loading meeting...</p>
      </div>
    );
  }

  if (!fullMeeting) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <p className="text-gray-600">Meeting not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-teal-600 hover:text-teal-700 font-semibold"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{fullMeeting.title || 'Untitled Meeting'}</h1>
            <p className="text-sm text-gray-500">
              Created: {formatDate(fullMeeting.createdAt)}
              {fullMeeting.updatedAt && fullMeeting.updatedAt !== fullMeeting.createdAt && (
                <span className="ml-2">• Updated: {formatDate(fullMeeting.updatedAt)}</span>
              )}
            </p>
            {fullMeeting.fileName && (
              <p className="text-sm text-teal-600 mt-1">
                Source: {fullMeeting.fileName} ({fullMeeting.fileType?.toUpperCase()})
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <FaArrowLeft />
            </button>
            {fullMeeting.createdBy === 'admin' && (
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <FaEdit />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              title="Download"
            >
              <FaDownload />
            </button>
          </div>
        </div>
      </div>

      {/* Content and AI Insights Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Meeting Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meeting Notes</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
              {fullMeeting.content || 'No content available'}
            </pre>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div>
          <AIInsightsPanel meeting={fullMeeting} />
        </div>
      </div>
    </div>
  );
}

