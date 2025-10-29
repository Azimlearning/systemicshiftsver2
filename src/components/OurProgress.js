// src/components/OurProgress.js
'use client'; // This component uses useState and is interactive

import Image from 'next/image';
import { useState } from 'react';

export default function OurProgress() {
  const [activeQuarter, setActiveQuarter] = useState('Q1'); // Default to Q1

  // Dynamic styling for the quarter tabs
  const getQuarterTabStyle = (quarterName) => `
    px-6 py-3 rounded-md font-semibold text-lg transition-all duration-200
    ${activeQuarter === quarterName
      ? 'bg-teal-500 text-white shadow-md' // Active state
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // Inactive state
    }
  `;

  return (
    <section id="our-progress" className="bg-gray-100 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Banner: Text and Q-tabs */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 rounded-lg shadow-lg mb-12">
          <p className="text-xl md:text-2xl font-light text-center mb-6">
            Step inside to explore the progress, milestones, and ideas shaping our journey
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setActiveQuarter('Q1')} className={getQuarterTabStyle('Q1')}>
              Q1
            </button>
            <button onClick={() => setActiveQuarter('Q2')} className={getQuarterTabStyle('Q2')}>
              Q2
            </button>
            <button onClick={() => setActiveQuarter('Q3')} className={getQuarterTabStyle('Q3')}>
              Q3
            </button>
            <button onClick={() => setActiveQuarter('Q4')} className={getQuarterTabStyle('Q4')}>
              Q4
            </button>
          </div>
        </div>

        {/* Content Display Area */}
        <div className="bg-white rounded-lg shadow-xl p-8 min-h-[700px] flex items-center justify-center">
          {activeQuarter === 'Q1' && (
            <Image
              src="/progress-q1-content.png" // The full Q1 content image
              alt="Q1 2025 Progress Milestones & Achievements"
              width={1200} // Adjust based on your cropped image
              height={1800} // Adjust based on your cropped image
              className="w-full h-auto"
            />
          )}

          {activeQuarter === 'Q2' && (
            <div className="text-center text-gray-600">
              <h3 className="text-3xl font-bold mb-4">Q2 Progress</h3>
              <p className="text-xl">Content for Q2 Milestones & Achievements will go here!</p>
              <p className="mt-4">Please upload `progress-q2-content.png` once available.</p>
            </div>
          )}

          {activeQuarter === 'Q3' && (
            <div className="text-center text-gray-600">
              <h3 className="text-3xl font-bold mb-4">Q3 Progress</h3>
              <p className="text-xl">Currently in progress...</p>
            </div>
          )}

          {activeQuarter === 'Q4' && (
            <div className="text-center text-gray-600">
              <h3 className="text-3xl font-bold mb-4">Q4 Progress</h3>
              <p className="text-xl">Currently in progress...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}