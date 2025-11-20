// src/app/meetx/shared/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MeetingList from '../../../components/MeetX/MeetingList';
import MeetingViewer from '../../../components/MeetX/MeetingViewer';

export default function SharedMeetingsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      router.push('/login?redirect=/meetx/shared');
      return;
    }
  }, [router]);

  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setViewMode('view');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMeeting(null);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {viewMode === 'list' && (
        <MeetingList
          onCreateMeeting={() => router.push('/meetx')}
          onViewMeeting={handleViewMeeting}
          onEditMeeting={() => {}}
          defaultFilter="shared"
        />
      )}
      
      {viewMode === 'view' && selectedMeeting && (
        <MeetingViewer
          meeting={selectedMeeting}
          onEdit={() => {}}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}

