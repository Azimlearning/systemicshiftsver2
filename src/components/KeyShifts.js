// src/components/KeyShifts.js
// ... (imports and useState) ...
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function KeyShifts() {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <section id="key-shifts" className="bg-gradient-to-br from-teal-800 to-indigo-900 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ... (Top Logo/Quote section unchanged) ... */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <div className="flex-shrink-0">
            <Image
              src="/systemic-shifts-logo.png"
              alt="Upstream Systemic Shifts Logo"
              width={250}
              height={70}
              className="h-auto"
            />
          </div>
          <div className="md:ml-8 flex-grow">
            <Image
              src="/key-shifts-quote.png"
              alt="Quote: In adapting to the ever-evolving business landscape..."
              width={600}
              height={150}
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 pt-16 md:pt-20 shadow-xl overflow-hidden mb-12">
          {/* Tab Buttons */}
          <div className="absolute top-0 left-0 w-full flex justify-stretch transform -translate-y-1/2 px-2 md:px-4"> {/* Use justify-stretch */}
            {/* Button 1: Portfolio High-Grading */}
            <button
              onClick={() => setActiveTab('portfolio')}
              // --- UPDATED CLASSES ---
              className={`flex-grow min-h-[50px] md:min-h-[60px] px-2 py-2 flex items-center justify-center rounded-t-lg shadow-lg text-white font-bold text-sm md:text-lg transition-all leading-tight text-center ${ // Reduced text size, padding, min-height
                activeTab === 'portfolio'
                  ? 'bg-gradient-to-r from-teal-500 to-green-600 z-10' // Active style + z-index
                  : 'bg-gray-700 bg-opacity-80 hover:bg-opacity-100' // Inactive style
              }`}
              // --- END UPDATE ---
            >
              Accelerate Portfolio High-Grading
            </button>

            {/* Button 2: Deliver Advantaged Barrels */}
            <button
              onClick={() => setActiveTab('barrels')}
               // --- UPDATED CLASSES ---
               className={`flex-grow min-h-[50px] md:min-h-[60px] px-2 py-2 flex items-center justify-center rounded-t-lg shadow-lg text-white font-bold text-sm md:text-lg transition-all leading-tight text-center ${ // Reduced text size, padding, min-height
                activeTab === 'barrels'
                  ? 'bg-gradient-to-r from-teal-500 to-green-600 z-10' // Active style + z-index
                  : 'bg-gray-700 bg-opacity-80 hover:bg-opacity-100' // Inactive style
              }`}
              // --- END UPDATE ---
            >
              Deliver Advantaged Barrels
            </button>
          </div>

          {/* Tab Content Area (Unchanged) */}
          <div className="relative z-10 text-gray-100 min-h-[400px]">
            {activeTab === 'portfolio' && (
              <div>
                <Image
                  src="/key-shifts-accelerate-portfolio-details.png"
                  alt="Accelerate Portfolio High-Grading Details"
                  width={1000}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-inner"
                />
              </div>
            )}

            {activeTab === 'barrels' && (
              <div>
                <Image
                  src="/key-shifts-deliver-advantaged-barrels.png"
                  alt="Deliver Advantaged Barrels Content"
                  width={1000}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-inner"
                />
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Image
              src="/explore-10-shifts.png"
              alt="Explore Our 10 Shifts"
              width={400}
              height={100}
              className="mx-auto h-auto"
            />
          </div>
        </div>
        {/* ... (Rest of component) */}
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 shadow-xl overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            The 10 Shifts define the differentiated outcomes that Upstream is pursuing...
          </h3>
          <Image
            src="/key-shifts-10-shifts-flow.png"
            alt="10 Shifts Flow Diagram"
            width={1200}
            height={1000}
            className="w-full h-auto rounded-lg shadow-inner"
          />
        </div>
      </div>
    </section>
  );
}