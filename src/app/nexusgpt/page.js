// src/app/nexusgpt/page.js
'use client'; 

import { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaRobot, FaTimes, FaSync, FaUpload, FaPlus } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StaticFAQ from '../../components/StaticFAQ'; // This is now the prompt bubbles
import ChatHistorySidebar from '../../components/chat/ChatHistorySidebar'; // Import the sidebar

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

  // Main Chat Submission Handler
  const handleChatSubmit = async (messageText) => {
    if (!messageText.trim() || isChatLoading) return;

    setChatInput('');
    setSuggestions([]);
    setIsChatLoading(true);
    setHasChatStarted(true); // <-- This switches the view

    const newUserMessage = { 
      role: 'user', 
      content: messageText, 
      timestamp: new Date() 
    };
    setChatHistory(prev => [...prev, newUserMessage]);

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
      const newAiMessage = { role: 'ai', content: data.reply, timestamp: new Date() };
      setChatHistory(prev => [...prev, newAiMessage]);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      const errorMessage = { role: 'error', content: `Sorry, an error occurred: ${error.message}`, timestamp: new Date() };
      setChatHistory(prev => [...prev, errorMessage]);
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
      <div className="flex-grow flex container mx-auto p-4 md:p-8 gap-6 h-[80vh]">

        {/* --- 1. Left Sidebar (Chat History) --- */}
        <nav className="w-64 flex-shrink-0 bg-gray-800 bg-opacity-30 p-4 rounded-lg flex flex-col">
          <ChatHistorySidebar onNewChat={handleClearChat} /> {/* Pass the handler */}
        </nav>
        {/* --- End Left Sidebar --- */}

        {/* --- 2. Main Chat Window --- */}
        <main className="flex-1 flex flex-col h-full">
          
          {/* --- Top Bar: Upload Icon & Clear Chat --- */}
          <div className="flex justify-end items-center mb-4">
              <button onClick={handleClearChat} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors" title="Clear chat history">
                  <FaSync /> Clear Chat
              </button>
              <button className="p-2 ml-4 text-gray-400 hover:text-white" title="Upload Document (WIP)">
                <FaUpload size={18} />
              </button>
          </div>

          {/* --- Conditional View --- */}
          {!hasChatStarted ? (
            // --- 3. Welcome / FAQ View ---
            <div className="flex-grow flex flex-col justify-center items-center">
              <div className="w-full max-w-3xl">
                 <StaticFAQ onQuestionClick={handleQuestionClick} />
              </div>
            </div>
          ) : (
            // --- 4. Chat History View ---
            <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto p-4 md:p-6 bg-white rounded-t-lg">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && <FaRobot className="text-2xl text-teal-600 mb-5 flex-shrink-0" />}
                  {msg.role === 'error' && <FaRobot className="text-2xl text-red-600 mb-5 flex-shrink-0" />}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 md:p-4 rounded-lg max-w-xs md:max-w-md shadow-md ${ msg.role === 'user' ? 'bg-gray-200 text-gray-800 rounded-br-none' : msg.role === 'ai' ? 'bg-teal-600 text-white rounded-bl-none' : 'bg-red-100 text-red-700 rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-1">{msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  {msg.role === 'user' && <FaUserCircle className="text-2xl text-gray-400 mb-5 flex-shrink-0" />}
                </div>
              ))}
              {isChatLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <FaRobot className="text-2xl text-teal-600 mb-5 flex-shrink-0" />
                    <div className="flex flex-col items-start">
                        <div className="bg-teal-600 text-white p-3 md:p-4 rounded-lg max-w-xs md:max-w-md shadow-md rounded-bl-none">
                            <div className="flex space-x-1 animate-pulse">
                                <div className="w-2 h-2 bg-teal-200 rounded-full"></div>
                                <div className="w-2 h-2 bg-teal-200 rounded-full animation-delay-200"></div>
                                <div className="w-2 h-2 bg-teal-200 rounded-full animation-delay-400"></div>
                            </div>
                        </div>
                         <span className="text-xs text-gray-400 mt-1 px-1">Typing...</span>
                    </div>
                 </div>
              )}
            </div>
          )}
          
          {/* --- 5. Input Bar --- */}
          <div className="w-full">
            {/* Suggestions Area */}
            {suggestions.length > 0 && !isChatLoading && (
              <div className="p-3 flex flex-wrap gap-2 justify-center bg-white border-t border-gray-200">
                  <span className="text-xs text-gray-500 w-full text-center mb-1">Suggestions:</span>
                  {suggestions.map((s, i) => (
                      <button key={i} onClick={() => handleQuestionClick(s)} className="text-sm bg-gray-100 border border-gray-300 text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-full transition-colors">
                          {s}
                      </button>
                  ))}
              </div>
            )}
            {/* Pill Design Input Bar (Modified for light bg) */}
            <form onSubmit={handleFormSubmit} className="flex border-t border-gray-300 bg-white rounded-b-lg relative items-center p-2">
              <textarea ref={inputRef} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type your question here..." rows="1" className="flex-grow p-3 bg-transparent border-none outline-none resize-none text-gray-900 overflow-y-auto" style={{ maxHeight: '6em' }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFormSubmit(e); }}}/>
              {chatInput && !isChatLoading && (
                <button type="button" onClick={() => setChatInput('')} className="text-gray-400 hover:text-gray-600 p-1 mx-2" title="Clear input">
                  <FaTimes />
                </button>
              )}
              <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-teal-600 text-white px-5 py-3 font-semibold rounded-full hover:bg-teal-700 transition-colors disabled:bg-gray-400">
                Send
              </button>
            </form>
          </div>
          
        </main>
        
      </div>
      <Footer />
    </div>
  );
}
