// src/app/nexushub/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Collaterals from '../../components/Collaterals';
import SystemicShiftsDropbox from '../../components/SystemicShiftsDropbox';

// Use a wrapper component to handle Suspense for useSearchParams
function NexusHubContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['collaterals', 'upg', 'dropbox'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('landing');
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'collaterals':
        return <Collaterals />;
      case 'upg':
        return <WorkInProgress />;
      case 'dropbox':
        return <SystemicShiftsDropbox />;
      case 'landing':
      default:
        return <NexusHubLanding />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center px-8">
          <h1 className="text-3xl font-bold text-teal-700">NexusHub</h1>
          <nav className="flex items-center">
            <Link href="/" className="py-4 px-6 text-lg font-semibold text-gray-500 hover:text-gray-800">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto flex">
          <TabButton label="Overview" isActive={activeTab === 'landing'} onClick={() => setActiveTab('landing')} />
          <TabButton label="Collaterals" isActive={activeTab === 'collaterals'} onClick={() => setActiveTab('collaterals')} />
          <TabButton label="UpG (Upstream Gallery)" isActive={activeTab === 'upg'} onClick={() => setActiveTab('upg')} />
          <TabButton label="Systemic Shifts Dropbox" isActive={activeTab === 'dropbox'} onClick={() => setActiveTab('dropbox')} />
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}

// Export default the page with Suspense wrapper
export default function NexusHubPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NexusHubContent />
    </Suspense>
  );
}

// Helper Components
const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`py-4 px-6 text-lg font-semibold transition-colors 
      ${isActive ? 'text-teal-600 border-b-4 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}
  >
    {label}
  </button>
);

const WorkInProgress = () => (
  <div className="bg-white p-12 rounded-lg shadow-lg text-center">
    <h3 className="text-3xl font-bold text-gray-800 mb-4">Work in Progress</h3>
    <p className="text-gray-600">This section is currently under development.</p>
  </div>
);

const NexusHubLanding = () => (
  <div className="bg-white p-12 rounded-lg shadow-lg text-center">
    <h3 className="text-4xl font-extrabold text-teal-700 mb-4">Welcome to NexusHub</h3>
    <p className="text-xl text-gray-600">Your central hub for digital items, collaterals, and submissions.</p>
  </div>
);
