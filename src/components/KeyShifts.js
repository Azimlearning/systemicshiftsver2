// src/components/KeyShifts.js
'use client'; // <-- IMPORTANT! We must add this to use state.

import Image from 'next/image';
import { useState } from 'react'; // <-- IMPORTANT! Import useState.

export default function KeyShifts() {
  // This is our state. 'barrels' or 'portfolio'.
  // We'll default to 'barrels' since it's the active one in your first screenshot.
  const [activeTab, setActiveTab] = useState('barrels');

  return (
    <section id="key-shifts" className="bg-gradient-to-br from-teal-800 to-indigo-900 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Section: Logo and Quote (This part is unchanged) */}
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

        {/* --- START OF INTERACTIVE TABS --- */}
        <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 pt-20 shadow-xl overflow-hidden mb-12">
          {/* Tab Buttons */}
          <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2 px-8">
            {/* Button 1: Portfolio High-Grading */}
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-8 py-4 rounded-t-lg shadow-lg text-white font-bold text-xl md:text-3xl transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-gradient-to-r from-teal-500 to-green-600' // Active style
                  : 'bg-gray-700 bg-opacity-80 hover:bg-opacity-100' // Inactive style
              }`}
            >
              Accelerate Portfolio<br />High-Grading
            </button>

            {/* Button 2: Deliver Advantaged Barrels */}
            <button
              onClick={() => setActiveTab('barrels')}
              className={`px-8 py-4 rounded-t-lg shadow-lg text-white font-bold text-xl md:text-3xl transition-all ${
                activeTab === 'barrels'
                  ? 'bg-gradient-to-r from-teal-500 to-green-600' // Active style
                  : 'bg-gray-700 bg-opacity-80 hover:bg-opacity-100' // Inactive style
              }`}
            >
              Deliver Advantaged<br />Barrels
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="relative z-10 text-gray-100 min-h-[400px]">
            {/* Content for 'Portfolio' Tab */}
            {activeTab === 'portfolio' && (
              <div>
                <Image
                  src="/key-shifts-accelerate-portfolio-details.png" // <-- Image from key shifts 3.jpg
                  alt="Accelerate Portfolio High-Grading Details"
                  width={1000}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-inner"
                />
              </div>
            )}

            {/* Content for 'Barrels' Tab */}
            {activeTab === 'barrels' && (
              <div>
                <Image
                  src="/key-shifts-deliver-advantaged-barrels.png" // <-- Image from key shifts 1.jpg
                  alt="Deliver Advantaged Barrels Content"
                  width={1000}
                  height={800}
                  className="w-full h-auto rounded-lg shadow-inner"
                />
              </div>
            )}
          </div>

          {/* "Explore Our 10 Shifts" Button (This is shared) */}
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
        {/* --- END OF INTERACTIVE TABS --- */}

        {/* Content Area 2: 10 Shifts Flow (This is now separate) */}
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 shadow-xl overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            The 10 Shifts define the differentiated outcomes that Upstream is pursuing...
          </h3>
          <Image
            src="/key-shifts-10-shifts-flow.png" // <-- Image from key shifts 2.jpg
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