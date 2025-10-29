// src/components/Faq.js
'use client'; // We need this for the interactive accordion and chat input

import { useState } from 'react';

// --- Part 1: Accordion Component ---
// We'll define a reusable component here for the accordion items
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
          {isOpen ? '-' : '+'}
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
  // Placeholder state for the chat input
  const [chatInput, setChatInput] = useState('');

  return (
    <section id="faq" className="bg-gray-100 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Frequently Asked Questions
        </h2>

        {/* --- Part 1: Top 3 Questions --- */}
        <div className="bg-white p-8 rounded-lg shadow-xl mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Top Questions</h3>
          
          <AccordionItem title="Question 1: Lorem ipsum dolor sit amet?">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </AccordionItem>
          
          <AccordionItem title="Question 2: Consectetur adipiscing elit?">
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </AccordionItem>
          
          <AccordionItem title="Question 3: Sed do eiusmod tempor incididunt ut labore?">
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </AccordionItem>
        </div>

        {/* --- Part 2: Chatbot UI Skeleton --- */}
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Still have questions? Ask our AI assistant.
          </h3>
          
          <div className="max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden">
            {/* Chat History Window */}
            <div className="h-80 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {/* Example AI Message */}
              <div className="flex justify-start">
                <div className="bg-teal-600 text-white p-4 rounded-lg max-w-xs shadow-md">
                  <p>Hi there! I'm the Systemic Shifts AI. How can I help you today?</p>
                </div>
              </div>
              
              {/* Example User Message (for styling) */}
              <div className="flex justify-end">
                <div className="bg-gray-200 text-gray-800 p-4 rounded-lg max-w-xs shadow-md">
                  <p>What is the target for NPV?</p>
                </div>
              </div>
            </div>
            
            {/* Input Form (Skeleton) */}
            <form 
              onSubmit={(e) => e.preventDefault()} // Prevents page reload
              className="flex border-t border-gray-300"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question here..."
                className="flex-grow p-4 border-none outline-none"
              />
              <button
                type="submit"
                className="bg-teal-600 text-white px-6 py-4 font-semibold hover:bg-teal-700 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
        
      </div>
    </section>
  );
}