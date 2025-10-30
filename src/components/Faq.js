// src/components/Faq.js
'use client'; 

import { useState, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

// --- Accordion Component --- 
function AccordionItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left"
      >
        <span className="text-xl font-semibold text-gray-800">{title}</span>
        <span className="text-2xl text-teal-600">
          {isOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 pr-10 text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}

// --- Main FAQ Component --- 
export default function Faq() {
  const [isClient, setIsClient] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'ai',
      content: "Hi there! I'm the Nexus Assistant. How can I help you today?"
    }
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatError('');
    setIsChatLoading(true);

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    const chatFunctionUrl = "https://askchatbot-el2jwxb5bq-uc.a.run.app"; 

    try {
      const response = await fetch(chatFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error("The assistant isn't available right now. Please try again later.");
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);

    } catch (error) {
      console.error("Chatbot fetch error:", error);
      setChatError(error.message);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    }

    setIsChatLoading(false);
  };

  if (!isClient) {
    return null;
  }

  return (
    <section id="faq" className="bg-gray-100 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="bg-white p-8 rounded-lg shadow-xl mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Top Questions</h3>
          
          <AccordionItem title="Question 1: What are the Systemic Shifts?">
            <p>
              The Systemic Shifts are a series of strategic initiatives by PETRONAS Upstream to achieve their 2035 goals. They focus on portfolio high-grading, delivering advantaged barrels, and operating with excellence.
            </p>
          </AccordionItem>
          
          <AccordionItem title="Question 2: What are the desired mindsets?">
            <p>
              The desired mindsets are a cultural shift towards being more risk-tolerant, commercially savvy, and fostering a growth mindset across the organization.
            </p>
          </AccordionItem>
          
          <AccordionItem title="Question 3: What is PETRONAS 2.0?">
            <p>
              PETRONAS 2.0 is the vision for the company's future by 2035, emphasizing innovation, sustainability, and a forward-thinking approach to the energy industry.
            </p>
          </AccordionItem>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Still have questions? Ask our AI assistant.
          </h3>
          
          <div className="max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden">
            <div className="h-80 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-lg max-w-xs shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-teal-600 text-white'
                  }`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                 <div className="flex justify-start">
                  <div className="bg-teal-600 text-white p-4 rounded-lg max-w-xs shadow-md">
                    <p className="animate-pulse">...</p>
                  </div>
                </div>
              )}

            </div>
            
            <form 
              onSubmit={handleChatSubmit}
              className="flex border-t border-gray-300"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isChatLoading ? "Waiting for response..." : "Type your question here..."}
                disabled={isChatLoading}
                className="flex-grow p-4 border-none outline-none disabled:bg-gray-100 text-gray-900"
              />
              <button
                type="submit"
                disabled={isChatLoading}
                className="bg-teal-600 text-white px-6 py-4 font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
              >
                Send
              </button>
            </form>
          </div>
          {chatError && <p className="text-red-500 text-sm text-center mt-2">{chatError}</p>}
        </div>
        
      </div>
    </section>
  );
}
