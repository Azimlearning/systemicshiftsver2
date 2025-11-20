// src/components/chat/ChatHistorySidebar.js
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaPlus, FaUserCircle, FaHome, FaTrash } from 'react-icons/fa';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

// --- NOW accepts an 'onNewChat' prop and 'onLoadSession' callback ---
export default function ChatHistorySidebar({ onNewChat, onLoadSession, currentSessionId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
    <nav className="w-full flex-shrink-0 flex flex-col justify-between h-full">
      <div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-lg font-semibold text-white hover:bg-gray-800 rounded-md mb-4 transition-colors" title="Back to Main Site">
            <FaHome />
            Back to Site
          </Link>
        </motion.div>
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <FaPlus />
          New Chat
        </motion.button>
        
        <div className="mt-6">
          <h3 className="text-gray-400 text-sm font-semibold mb-3 px-2 uppercase tracking-wider">Recent Chats</h3>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div className="h-4 bg-gray-600/50 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-600/30 rounded animate-pulse w-2/3"></div>
                  </motion.div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-400 text-sm p-4 text-center bg-gray-700/20 rounded-lg"
              >
                No previous chats
              </motion.div>
            ) : (
              <AnimatePresence>
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => handleLoadSession(session)}
                    className={`group p-3 text-gray-300 text-sm rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                      currentSessionId === session.id
                        ? 'bg-teal-600/30 border border-teal-500/50'
                        : 'hover:bg-gray-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium" title={session.title || 'Untitled Chat'}>
                        {session.title || 'Untitled Chat'}
                      </div>
                      {session.lastActivity && (
                        <div className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(session.lastActivity)}
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-70 hover:opacity-100 text-red-400 hover:text-red-600 p-1.5 ml-2 transition-all flex-shrink-0"
                      title="Delete chat"
                    >
                      <FaTrash size={14} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t border-gray-700 pt-4 flex items-center gap-3"
      >
        <motion.div whileHover={{ scale: 1.1 }}>
          <FaUserCircle size={28} className="text-gray-400" />
        </motion.div>
        <span className="font-semibold text-white">Fakhrul Azim</span>
      </motion.div>
    </nav>
  );
}
