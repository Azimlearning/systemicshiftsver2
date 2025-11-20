// src/app/meetx/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MeetingList from '../../components/MeetX/MeetingList';
import MeetingEditor from '../../components/MeetX/MeetingEditor';
import MeetingViewer from '../../components/MeetX/MeetingViewer';

export default function MeetXPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      router.push('/login?redirect=/meetx');
      return;
    }
  }, [router]);

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
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {viewMode === 'list' && (
        <MeetingList
          onCreateMeeting={handleCreateMeeting}
          onViewMeeting={handleViewMeeting}
          onEditMeeting={handleEditMeeting}
        />
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
