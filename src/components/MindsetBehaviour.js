// src/components/MindsetBehaviour.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function MindsetBehaviour() {
  const [activeTab, setActiveTab] = useState('savvy'); // Default to Commercial Savvy (Image 1)

  // Styling for the dynamic tab buttons
  const getTabButtonStyle = (tabName) => `
    flex-1 p-4 md:p-6 text-center text-white font-bold text-xl md:text-2xl rounded-t-lg shadow-lg
    transition-all duration-300 ease-in-out cursor-pointer
    ${
      activeTab === tabName
        ? 'bg-gradient-to-r from-teal-500 to-green-600' // Active style
        : 'bg-gray-700 bg-opacity-80 hover:bg-opacity-100' // Inactive style
    }
  `;

  return (
    <section id="mindset-behaviour" className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Top Banner Text (HTML/CSS) */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-3xl font-semibold text-teal-300 leading-relaxed mb-6">
            For Upstream to become <span className="font-extrabold">Fitter, Focused</span> and <span className="font-extrabold">Sharper</span>,<br />
            we require a <span className="font-extrabold">Mindset & Behaviour Shifts</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 uppercase">Desired Mindset</h2>
        </div>

        {/* Tabbed Content Area */}
        <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 pt-20 shadow-xl overflow-hidden mb-12">

          {/* Tab Buttons */}
          <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2 px-4 md:px-8">
            <button
              onClick={() => setActiveTab('tolerant')}
              className={getTabButtonStyle('tolerant')}
            >
              More Risk<br />Tolerant
            </button>
            <button
              onClick={() => setActiveTab('savvy')}
              className={getTabButtonStyle('savvy')}
            >
              Commercial<br />Savvy
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={getTabButtonStyle('growth')}
            >
              Growth<br />Mindset
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="relative z-10 text-gray-100 min-h-[600px] flex items-center justify-center">
            {activeTab === 'tolerant' && (
              <Image
                src="/mindset-risk-tolerant-content.png" // Image from Image 2
                alt="More Risk Tolerant Mindset"
                width={1000}
                height={800}
                className="w-full h-auto rounded-lg shadow-inner"
              />
            )}
            {activeTab === 'savvy' && (
              <Image
                src="/mindset-commercial-savvy-content.png" // Image from Image 1
                alt="Commercial Savvy Mindset"
                width={1000}
                height={800}
                className="w-full h-auto rounded-lg shadow-inner"
              />
            )}
            {activeTab === 'growth' && (
              <Image
                src="/mindset-growth-mindset-content.png" // Image from Image 3
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