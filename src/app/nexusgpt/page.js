// src/app/nexusgpt/page.js
'use client'; // This page contains client components

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatInterface from '../../components/ChatInterface';
import StaticFAQ from '../../components/StaticFAQ';

export default function NexusGPTPage() {
  // --- IMPORTANT: Get your deployed function URL ---
  // You must set this URL for the chat to work.
  const chatFunctionUrl = "https://askchatbot-el2jwxb5bq-uc.a.run.app"; // <-- FIXED URL

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900">
      <Header />

      {/* --- ADDED relative z-10 --- */}
      <main className="flex-grow container mx-auto p-4 md:p-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            NexusGPT
          </h1>
          <p className="text-xl text-gray-300">
            Your AI assistant for Systemic Shifts and more.
          </p>
        </div>

        {/* --- New Two-Column Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Chat Area (takes 2/3 of the space) */}
          <div className="lg:col-span-2 h-[75vh]">
            <ChatInterface chatFunctionUrl={chatFunctionUrl} />
          </div>

          {/* Sidebar for Static FAQ (takes 1/3 of the space) */}
          <div className="lg:col-span-1">
            <StaticFAQ />
          </div>

        </div>
        {/* --- End Two-Column Layout --- */}
        
      </main>
      
      <Footer />
    </div>
  );
}
