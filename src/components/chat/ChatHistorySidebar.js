// src/components/chat/ChatHistorySidebar.js
'use client';
import Link from 'next/link';
import { FaPlus, FaUserCircle, FaHome } from 'react-icons/fa';

// --- NOW accepts an 'onNewChat' prop ---
export default function ChatHistorySidebar({ onNewChat }) {
  const dummyHistory = [
    'AI write-up generation failed...',
    'What is PETRONAS 2.0?',
    'NexusHub Login Details',
    'Summarize Azim Test 11',
  ];

  return (
    <nav className="w-64 flex-shrink-0 bg-gray-800 bg-opacity-30 p-4 rounded-lg flex flex-col justify-between">
      <div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-lg font-semibold text-white hover:bg-gray-800 rounded-md mb-4" title="Back to Main Site">
          <FaHome />
          Back to Site
        </Link>
        <button 
          onClick={onNewChat} // <-- This now calls the function from the parent
          className="w-full flex items-center justify-center gap-2 px-3 py-3 text-left text-white bg-teal-600 hover:bg-teal-700 rounded-md font-semibold"
        >
          <FaPlus />
          New Chat
        </button>
        
        <div className="mt-6">
          <h3 className="text-gray-400 text-sm font-semibold mb-2 px-2 uppercase">Recent Chats</h3>
          <div className="flex flex-col gap-1 overflow-y-auto">
            {dummyHistory.map((item, index) => (
              <div key={index} className="p-2 text-gray-300 text-sm truncate whitespace-nowrap text-ellipsis opacity-70 rounded hover:bg-gray-700/50 cursor-pointer">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 flex items-center gap-3">
        <FaUserCircle size={28} />
        <span className="font-semibold">Fakhrul Azim</span>
      </div>
    </nav>
  );
}
