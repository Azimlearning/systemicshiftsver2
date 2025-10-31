// src/components/MiniChatWidget.js
'use client';
import { useState }from 'react';
import ChatInterface from './ChatInterface';
import { FaCommentDots, FaTimes } from 'react-icons/fa';

export default function MiniChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // --- IMPORTANT: Get your deployed function URL ---
  const chatFunctionUrl = "https://askchatbot-el2jwxb5bq-uc.a.run.app"; // <-- FIXED URL

  return (
    <>
      {/* Chat Bubble Button (Bottom Left) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-transform hover:scale-110 z-50"
          aria-label="Open Chat"
        >
          <FaCommentDots size={24} />
        </button>
      )}

      {/* Chat Popup Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-[90vw] max-w-sm h-[70vh] max-h-[500px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-300 z-50 animate-fade-in-up">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-teal-600 text-white rounded-t-lg">
            <h3 className="font-semibold">Nexus Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-teal-700 p-1 rounded-full"
              aria-label="Close Chat"
            >
              <FaTimes size={18} />
            </button>
          </div>
          {/* Chat Interface */}
          <div className="flex-grow overflow-hidden">
            <ChatInterface chatFunctionUrl={chatFunctionUrl} />
          </div>
        </div>
      )}
    </>
  );
}
