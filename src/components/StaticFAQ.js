// src/components/StaticFAQ.js
'use client';
import { useState } from 'react';

function AccordionItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 text-left"
      >
        <span className="text-lg font-medium text-gray-100">{title}</span>
        <span className="text-2xl text-teal-400">
          {isOpen ? '-' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 pr-10 text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}

export default function StaticFAQ() {
    return (
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6">Top Questions</h3>
          <AccordionItem title="Question 1: What is PETRONAS 2.0?">
             <p>PETRONAS 2.0 is the vision to become an Integrated energy company by 2035, serving the world's energy needs safely, reliably, and sustainably.</p>
          </AccordionItem>
          <AccordionItem title="Question 2: What are the Key Shifts?">
             <p>The two Key Shifts are "Accelerate Portfolio High-Grading" and "Deliver Advantaged Barrels".</p>
          </AccordionItem>
          <AccordionItem title="Question 3: What are the Desired Mindsets?">
            <p>The three Desired Mindsets are "More Risk Tolerant", "Commercial Savvy", and "Growth Mindset".</p>
          </AccordionItem>
        </div>
    );
}
