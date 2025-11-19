// src/components/chat/ChatHistorySidebar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaUserCircle, FaHome, FaTrash } from 'react-icons/fa';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

// --- NOW accepts an 'onNewChat' prop and 'onLoadSession' callback ---
export default function ChatHistorySidebar({ onNewChat, onLoadSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load chat sessions from Firestore
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const q = query(
          collection(db, 'chatSessions'),
          orderBy('lastActivity', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const sessionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(sessionsData);
      } catch (error) {
        console.error('[ChatHistorySidebar] Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Handle loading a session
  const handleLoadSession = async (session) => {
    if (onLoadSession && session.messages) {
      // Convert Firestore timestamps to Date objects
      const messages = session.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
      }));
      onLoadSession(messages, session.id);
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'chatSessions', sessionId));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('[ChatHistorySidebar] Error deleting session:', error);
      alert('Failed to delete chat');
    }
  };

  return (
    <nav className="w-64 flex-shrink-0 bg-gray-800 bg-opacity-30 p-4 rounded-lg flex flex-col justify-between">
      <div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-lg font-semibold text-white hover:bg-gray-800 rounded-md mb-4" title="Back to Main Site">
          <FaHome />
          Back to Site
        </Link>
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 text-left text-white bg-teal-600 hover:bg-teal-700 rounded-md font-semibold"
        >
          <FaPlus />
          New Chat
        </button>
        
        <div className="mt-6">
          <h3 className="text-gray-400 text-sm font-semibold mb-2 px-2 uppercase">Recent Chats</h3>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-gray-400 text-sm p-2">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-gray-400 text-sm p-2">No previous chats</div>
            ) : (
              sessions.map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => handleLoadSession(session)}
                  className="group p-2 text-gray-300 text-sm truncate rounded hover:bg-gray-700/50 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex-1 truncate" title={session.title || 'Untitled Chat'}>
                    {session.title || 'Untitled Chat'}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1"
                    title="Delete chat"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))
            )}
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
