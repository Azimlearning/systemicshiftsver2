// src/app/nexusgpt/page.js
'use client'; 

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaRobot, FaTimes, FaSync, FaUpload, FaPlus, FaDatabase, FaPaperPlane } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StaticFAQ from '../../components/StaticFAQ'; // This is now the prompt bubbles
import ChatHistorySidebar from '../../components/chat/ChatHistorySidebar'; // Import the sidebar
import KnowledgeBaseInjector from '../../components/KnowledgeBaseInjector';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function NexusGPTPage() {
  // --- IMPORTANT: Get your deployed function URL ---
  const chatFunctionUrl = "https://askchatbot-el2jwxb5bq-uc.a.run.app"; // <-- PASTE YOUR URL
  
  // --- All Chat Logic now lives on this page ---
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const initialHistory = [
    {
      role: 'ai',
      content: "Hi there! I'm the Nexus Assistant. How can I help you today?",
      timestamp: new Date()
    }
  ];
  const [chatHistory, setChatHistory] = useState(initialHistory);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // --- State to control UI view ---
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Auto-Scrolling Effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Auto-Focus Effect
  useEffect(() => {
    inputRef.current?.focus();
  }, [hasChatStarted]); // Focus when chat starts

  // Create or get current chat session
  const getOrCreateSession = async () => {
    if (currentSessionId) {
      return currentSessionId;
    }

    try {
      const sessionData = {
        messages: [],
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        title: 'New Chat'
      };
      const docRef = await addDoc(collection(db, 'chatSessions'), sessionData);
      setCurrentSessionId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[Chat] Error creating session:', error);
      return null;
    }
  };

  // Save message to Firestore
  const saveMessageToSession = async (message, sessionId, currentHistory) => {
    if (!sessionId) return;

    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        messages: currentHistory || [...chatHistory, message],
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('[Chat] Error saving message:', error);
    }
  };

  // Main Chat Submission Handler
  const handleChatSubmit = async (messageText) => {
    if (!messageText.trim() || isChatLoading) return;

    setChatInput('');
    setSuggestions([]);
    setIsChatLoading(true);
    setHasChatStarted(true); // <-- This switches the view

    // Get or create session
    const sessionId = await getOrCreateSession();

    const newUserMessage = { 
      role: 'user', 
      content: messageText, 
      timestamp: new Date() 
    };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    
    // Save user message to session
    await saveMessageToSession(newUserMessage, sessionId, updatedHistory);

    try {
      const response = await fetch(chatFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
         let errorDetail = "The assistant isn't available right now.";
         try { const errorData = await response.json(); errorDetail = errorData.error || errorDetail; } catch {}
         throw new Error(errorDetail);
      }

      const data = await response.json();
      const newAiMessage = { 
        role: 'ai', 
        content: data.reply, 
        timestamp: new Date(),
        citations: data.citations || []
      };
      // Use updatedHistory (which includes user message) instead of chatHistory
      const finalHistory = [...updatedHistory, newAiMessage];
      setChatHistory(finalHistory);
      setSuggestions(data.suggestions || []);
      
      // Save AI message to session
      await saveMessageToSession(newAiMessage, sessionId, finalHistory);
      
      // Update session title from first user message if it's still "New Chat"
      if (sessionId) {
        try {
          const sessionRef = doc(db, 'chatSessions', sessionId);
          const firstUserMsg = updatedHistory.find(m => m.role === 'user');
          if (firstUserMsg) {
            const title = firstUserMsg.content.substring(0, 50);
            await updateDoc(sessionRef, {
              title: title.length >= 50 ? title + '...' : title
            });
          }
        } catch (error) {
          console.error('[Chat] Error updating session title:', error);
        }
      }
    } catch (error) {
      const errorMessage = { role: 'error', content: `Sorry, an error occurred: ${error.message}`, timestamp: new Date() };
      // Use updatedHistory to preserve user message
      const errorHistory = [...updatedHistory, errorMessage];
      setChatHistory(errorHistory);
      await saveMessageToSession(errorMessage, sessionId, errorHistory);
    }
    setIsChatLoading(false);
  };

  // Form submission (from text bar)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleChatSubmit(chatInput);
  };

  // Question Click (from FAQ)
  const handleQuestionClick = (question) => {
    handleChatSubmit(question); // Send the question directly
  };

  // Clear Chat Handler
  const handleClearChat = () => {
    setChatHistory(initialHistory);
    setSuggestions([]);
    setHasChatStarted(false); // <-- Reset the view
    setCurrentSessionId(null); // Reset session for new chat
  };

  // Load a chat session
  const handleLoadSession = (messages, sessionId) => {
    setChatHistory(messages);
    setCurrentSessionId(sessionId);
    setHasChatStarted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-gray-200">
      <Header />
      
      {/* Page Title */}
      <div className="container mx-auto px-4 md:px-8 pt-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">NexusGPT</h1>
        <p className="text-lg text-gray-300">Your AI assistant for Systemic Shifts and more.</p>
      </div>

      {/* --- Main Two-Column Content Area --- */}
      <div className="flex-grow flex flex-col lg:flex-row container mx-auto p-4 md:p-8 gap-6">

        {/* --- 1. Left Sidebar (Chat History) --- */}
        <nav className="w-full lg:w-64 flex-shrink-0 bg-gray-800 bg-opacity-30 p-4 rounded-lg flex flex-col mb-6 lg:mb-0">
          <ChatHistorySidebar 
            onNewChat={handleClearChat} 
            onLoadSession={handleLoadSession}
            currentSessionId={currentSessionId}
          />
        </nav>
        {/* --- End Left Sidebar --- */}

        {/* --- 2. Main Chat Window --- */}
        <main className="flex-1 flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
          
          {/* --- Top Bar: Knowledge Base Injector & Clear Chat --- */}
          <div className="flex justify-end items-center p-4 border-b border-gray-200 bg-gray-50">
              <motion.button 
                onClick={handleClearChat} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors" 
                title="Clear chat history"
              >
                  <FaSync /> Clear Chat
              </motion.button>
              <motion.button 
                onClick={() => setIsInjectorOpen(true)} 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 ml-4 text-gray-400 hover:text-teal-500 transition-colors" 
                title="Add to Knowledge Base"
              >
                <FaDatabase size={18} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 ml-4 text-gray-400 hover:text-gray-600" 
                title="Upload Document (WIP)"
              >
                <FaUpload size={18} />
              </motion.button>
          </div>

          {/* --- Conditional View --- */}
          <AnimatePresence mode="wait">
            {!hasChatStarted ? (
              // --- 3. Welcome / FAQ View ---
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-grow flex flex-col justify-center items-center"
              >
                <div className="w-full max-w-3xl">
                  <StaticFAQ onQuestionClick={handleQuestionClick} />
                </div>
              </motion.div>
            ) : (
              // --- 4. Chat History View ---
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                ref={chatContainerRef}
                className="flex-grow space-y-4 overflow-y-auto p-4 md:p-6 bg-white rounded-t-lg scrollbar-thin"
              >
              <AnimatePresence mode="popLayout">
                {chatHistory.map((msg, index) => (
                  <motion.div
                    key={`${msg.role}-${index}-${msg.timestamp?.getTime() || index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index === chatHistory.length - 1 ? 0 : 0,
                      ease: "easeOut"
                    }}
                    className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="mb-5 flex-shrink-0"
                      >
                        <FaRobot className="text-2xl text-teal-600" />
                      </motion.div>
                    )}
                    {msg.role === 'error' && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="mb-5 flex-shrink-0"
                      >
                        <FaRobot className="text-2xl text-red-600" />
                      </motion.div>
                    )}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[70%]`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 md:p-5 rounded-2xl shadow-lg break-words ${ 
                          msg.role === 'user' 
                            ? 'bg-gray-200 text-gray-800 rounded-br-md' 
                            : msg.role === 'ai' 
                              ? 'bg-teal-600 text-white rounded-bl-md' 
                              : 'bg-red-100 text-red-700 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.citations && msg.citations.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 pt-4 border-t border-teal-400 border-opacity-30"
                          >
                            <p className="text-xs font-semibold mb-2 opacity-90">Sources:</p>
                            <div className="space-y-1.5">
                              {msg.citations.map((citation, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 + idx * 0.1 }}
                                  whileHover={{ x: 4 }}
                                  className="text-xs opacity-80 hover:opacity-100 transition-opacity"
                                >
                                  • {citation.title}
                                  {citation.sourceUrl && (
                                    <a 
                                      href={citation.sourceUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-1 opacity-70 hover:opacity-100 hover:text-teal-300 underline"
                                    >
                                      ({citation.sourceUrl})
                                    </a>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                      <span className="text-xs text-gray-400 mt-2 px-2">{msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    {msg.role === 'user' && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="mb-5 flex-shrink-0"
                      >
                        <FaUserCircle className="text-2xl text-gray-400" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-3 justify-start"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="mb-5 flex-shrink-0"
                  >
                    <FaRobot className="text-2xl text-teal-600" />
                  </motion.div>
                  <div className="flex flex-col items-start">
                    <div className="bg-teal-600 text-white p-4 md:p-5 rounded-2xl rounded-bl-md shadow-lg">
                      <div className="flex space-x-2">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-teal-200 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-teal-200 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-teal-200 rounded-full"
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-2 px-2">Typing...</span>
                  </div>
                </motion.div>
              )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* --- 5. Input Bar --- */}
          <div className="w-full">
            {/* Suggestions Area */}
            <AnimatePresence>
              {suggestions.length > 0 && !isChatLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 flex flex-wrap gap-2 justify-center bg-white border-t border-gray-200"
                >
                  <span className="text-xs text-gray-500 w-full text-center mb-2 font-semibold">Suggestions:</span>
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuestionClick(s)}
                      className="text-sm bg-gray-100 border border-gray-300 text-teal-700 hover:bg-teal-50 hover:border-teal-300 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Pill Design Input Bar (Modified for light bg) */}
            <form onSubmit={handleFormSubmit} className="flex border-t border-gray-300 bg-white rounded-b-lg relative items-center p-3 gap-2">
              <textarea 
                ref={inputRef} 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder="Type your question here..." 
                rows="1" 
                className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-gray-900 overflow-y-auto transition-all" 
                style={{ maxHeight: '6em' }} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFormSubmit(e); }}}
              />
              <AnimatePresence>
                {chatInput && !isChatLoading && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => setChatInput('')} 
                    className="text-gray-400 hover:text-gray-600 p-2" 
                    title="Clear input"
                  >
                    <FaTimes />
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                whileHover={!isChatLoading && chatInput.trim() ? { scale: 1.05 } : {}}
                whileTap={!isChatLoading && chatInput.trim() ? { scale: 0.95 } : {}}
                className="bg-teal-600 text-white px-6 py-3 font-semibold rounded-full hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaPaperPlane size={14} />
                Send
              </motion.button>
            </form>
          </div>
          
        </main>
        
      </div>
      
      {/* Knowledge Base Injector Modal */}
      <KnowledgeBaseInjector 
        isOpen={isInjectorOpen} 
        onClose={() => setIsInjectorOpen(false)} 
      />
      
      <Footer />
    </div>
  );
}
