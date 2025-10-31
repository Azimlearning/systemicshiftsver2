// src/components/ChatInterface.js
'use client'; 
// This code is the logic from your old Faq.js, now reusable
import { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaRobot, FaTimes, FaSync } from 'react-icons/fa';

export default function ChatInterface({ chatFunctionUrl }) {
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
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    setSuggestions([]);
    setIsChatLoading(true);
    const newUserMessage = { role: 'user', content: userMessage, timestamp: new Date() };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch(chatFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
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

  const handleClearChat = () => {
    setChatHistory(initialHistory);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setChatInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b">
         <h3 className="text-lg font-semibold text-gray-700">Ask Nexus Assistant</h3>
         <button 
           onClick={handleClearChat}
           className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
           title="Clear chat history"
         >
           <FaSync /> Clear Chat
         </button>
      </div>

      <div ref={chatContainerRef} className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto bg-gray-50">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && <FaRobot className="text-2xl text-teal-600 mb-5 flex-shrink-0" />}
            {msg.role === 'error' && <FaRobot className="text-2xl text-red-600 mb-5 flex-shrink-0" />}
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 md:p-4 rounded-lg max-w-xs md:max-w-md shadow-md ${ msg.role === 'user' ? 'bg-gray-200 text-gray-800 rounded-br-none' : msg.role === 'ai' ? 'bg-teal-600 text-white rounded-bl-none' : 'bg-red-100 text-red-700 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {/* --- FIX: Added suppressHydrationWarning to the span --- */}
              <span suppressHydrationWarning className="text-xs text-gray-400 mt-1 px-1">{msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
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

      {suggestions.length > 0 && !isChatLoading && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-gray-500 w-full text-center mb-1">Suggestions:</span>
            {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSuggestionClick(s)} className="text-sm bg-white border border-gray-300 text-teal-700 hover:bg-teal-50 px-3 py-1 rounded-full transition-colors">
                    {s}
                </button>
            ))}
        </div>
      )}
      
      <form onSubmit={handleChatSubmit} className="flex border-t border-gray-300 relative items-center">
        <textarea ref={inputRef} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={isChatLoading ? "Nexus Assistant is thinking..." : "Type your question here..."} disabled={isChatLoading} rows="1" className="flex-grow p-4 pr-10 border-none outline-none resize-none disabled:bg-gray-100 text-gray-900 overflow-y-auto" style={{ maxHeight: '6em' }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(e); }}}/>
        {chatInput && !isChatLoading && (
          <button type="button" onClick={() => setChatInput('')} className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" title="Clear input">
            <FaTimes />
          </button>
        )}
        <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-teal-600 text-white px-6 py-4 font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400">
          Send
        </button>
      </form>
    </div>
  );
}
