// src/components/MindsetBehaviour.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function MindsetBehaviour() {
  const [activeTab, setActiveTab] = useState('tolerant');

  // --- UPDATED STYLING FUNCTION ---
  const getTabButtonStyle = (tabName) => `
    flex-grow min-h-[50px] md:min-h-[60px] px-2 py-2 flex items-center justify-center text-center text-white font-bold text-sm md:text-lg rounded-t-lg shadow-lg /* Reduced text size, padding, min-height */
    transition-all duration-300 ease-in-out cursor-pointer leading-tight
    ${activeTab === tabName
      ? 'bg-gradient-to-r from-teal-500 to-green-600 z-10' // Active style + z-index
      : 'bg-gray-700 bg-opacity-80 hover:bg-opacity-100' // Inactive style
    }
  `;
  // --- END UPDATE ---

  return (
    <section id="mindset-behaviour" className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ... (Top Banner Text unchanged) ... */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-3xl font-semibold text-teal-300 leading-relaxed mb-6">
            For Upstream to become <span className="font-extrabold">Fitter, Focused</span> and <span className="font-extrabold">Sharper</span>,<br />
            we require a <span className="font-extrabold">Mindset & Behaviour Shifts</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 uppercase">Desired Mindset</h2>
        </div>

        <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 pt-16 md:pt-20 shadow-xl overflow-hidden mb-12">
          {/* Tab Buttons */}
          <div className="absolute top-0 left-0 w-full flex justify-stretch transform -translate-y-1/2 px-1 md:px-2"> {/* Use justify-stretch, reduced padding slightly */}
            <button
              onClick={() => setActiveTab('tolerant')}
              className={getTabButtonStyle('tolerant')}
            >
              More Risk Tolerant
            </button>
            <button
              onClick={() => setActiveTab('savvy')}
              className={getTabButtonStyle('savvy')}
            >
              Commercial Savvy
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={getTabButtonStyle('growth')}
            >
              Growth Mindset
            </button>
          </div>

          {/* Tab Content Display (Unchanged) */}
          <div className="relative z-10 text-gray-100 min-h-[600px] flex items-center justify-center">
            {activeTab === 'tolerant' && (
              <Image
                src="/mindset-risk-tolerant-content.png"
                alt="More Risk Tolerant Mindset"
                width={1000}
                height={800}
                className="w-full h-auto rounded-lg shadow-inner"
              />
            )}
            {activeTab === 'savvy' && (
              <Image
                src="/mindset-commercial-savvy-content.png"
                alt="Commercial Savvy Mindset"
                width={1000}
                height={800}
                className="w-full h-auto rounded-lg shadow-inner"
              />
            )}
            {activeTab === 'growth' && (
              <Image
                src="/mindset-growth-mindset-content.png"
                alt="Growth Mindset"
                width={1000}
                height={800}
                className="w-full h-auto rounded-lg shadow-inner"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
