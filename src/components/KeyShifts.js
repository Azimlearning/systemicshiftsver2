// src/components/KeyShifts.js
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaClock, FaChartLine } from 'react-icons/fa';

/**
 * Key Shifts Component
 * 
 * Features:
 * - Logo with quote text (not using AI-generated text)
 * - Redesigned tabs matching UpstreamTarget theme
 * - Code-based content replacing images
 * - Button to open 10 Shifts popup overlay
 * - Modal popup for 10 Shifts content
 */
export default function KeyShifts() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Portfolio High-Grading data
  const portfolioItems = [
    {
      id: 'pcsb',
      title: 'PCSB (Malaysia)',
      description: 'Reposition, dilution and divestment of assets to focus on High-Value, High-Upside',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', // blue
    },
    {
      id: 'vestigo',
      title: 'Vestigo (Malaysia & International)',
      description: 'Expand and value-grow marginal assets portfolio in Malaysia and International',
      gradient: 'linear-gradient(135deg, #10b981, #059669)', // green
    },
    {
      id: 'pciv',
      title: 'PCIV (International)',
      description: 'Disciplined asset dilution and portfolio high-grading',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', // purple
    },
    {
      id: 'ccs',
      title: 'CCS',
      description: 'Create value through diversified portfolio',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', // amber
    },
    {
      id: 'satellite',
      title: 'Satellite Model',
      description: 'Unlock opportunities through unique partnership model',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)', // pink
    },
  ];

  // Deliver Advantaged Barrels data
  const barrelsSections = [
    {
      id: 'risk',
      title: 'More Risk Tolerant',
      items: [
        'Deploy fit-for-purpose/international technical standards',
        'Adopt innovative and market-friendly contracting approach',
      ],
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', // cyan
    },
    {
      id: 'efficiency',
      title: 'Improve Cost & Operational Efficiency',
      items: [
        'Deploy practical and innovative solutions at pace',
        'Scale-up technology deployment',
        'Embrace AI-enabled business operations',
      ],
      gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', // teal
    },
    {
      id: 'partnership',
      title: 'Pursue Partnership for Growth and Innovative Solutions',
      items: [
        'Leverage on selective partners to tap innovative solutions',
      ],
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', // indigo
    },
  ];

  // 10 Shifts data
  const tenShifts = [
    {
      id: 1,
      phase: 'EXPLORATION',
      text: 'Scale-up clustered Exploration approach to **improve chance of success** above International benchmark >35%',
      icons: ['value', 'time'],
    },
    {
      id: 2,
      phase: 'DEVELOPMENT',
      text: 'Accelerate discovery to pre-development (PGR 1) from **36 months to 18 months**',
      icons: ['time'],
    },
    {
      id: 3,
      phase: 'DEVELOPMENT',
      text: 'Monetisation with pace from last appraisal to 1st HC from **35-100 months to 24-48 months**',
      icons: ['time'],
    },
    {
      id: 4,
      phase: 'DEVELOPMENT',
      text: 'Portfolio-based versus Project-based approach on key resources e.g. FPSO, Refurbished Wellhead platform, Subsea system',
      icons: ['time'],
    },
    {
      id: 5,
      phase: 'PRODUCTION',
      text: 'Adopting unconventional approach to **reduce CAPEX up to 30%** including overhauling contracting strategy',
      icons: ['value'],
    },
    {
      id: 6,
      phase: 'PRODUCTION',
      text: 'Improve volume certainty and attainability from **70% to 90%** through AI-driven technology application e.g. Seismic AI, ERMAI, Ensemble',
      icons: ['value'],
    },
    {
      id: 7,
      phase: 'PRODUCTION',
      text: 'Design It Right: Fit-for-purpose project design with efficient operation, competitive CAPEX and low carbon',
      icons: ['value'],
    },
    {
      id: 8,
      phase: 'PRODUCTION',
      text: 'Operate It Right: Maximise production to support UPC < USD6/Boe & CI 17 kgCO2e/boe (portfolio level)',
      icons: ['value'],
    },
    {
      id: 9,
      phase: 'PRODUCTION',
      text: 'Deliver Technology and AI solutions through **partnership to build competitive edge** e.g. TriCipta AI, ERMAI',
      icons: ['value'],
    },
    {
      id: 10,
      phase: 'CCS BUSINESS',
      text: 'Value-driven diversified CCS Portfolio in Malaysia and International',
      icons: ['value'],
    },
  ];

  return (
    <section id="key-shifts" className="bg-gradient-to-br from-teal-800 via-teal-900 to-indigo-900 text-white pt-8 md:pt-12 pb-8 md:pb-12 scroll-mt-32">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Logo and Quote Section - Compact */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
          {/* Logo - Smaller */}
          <div className="flex-shrink-0">
            <Image
              src="/Systemic-Shifts-Logo/systemic-shifts-logo-BlackWhite.png"
              alt="Upstream Systemic Shifts Logo"
              width={200}
              height={56}
              className="h-auto"
            />
          </div>
          
          {/* Quote Text - Written in code, not AI-generated - More Compact */}
          <div className="md:ml-6 flex-grow bg-white rounded-xl p-4 md:p-6 shadow-xl">
            <div className="relative">
              <div className="text-4xl md:text-6xl text-teal-500 font-serif leading-none" style={{ lineHeight: '0.5' }}>
                &ldquo;
              </div>
              <p className="text-base md:text-lg text-teal-600 leading-relaxed relative z-10 -mt-3 md:-mt-4 pl-3">
                In adapting to the ever-evolving business landscape, we need to reshape how we operate as an Upstream business. Our strategy is anchored on being a{' '}
                <span className="font-bold text-teal-700">Pure Commercial Play</span>, driven by{' '}
                <span className="font-bold text-teal-700">two key shifts</span>.
              </p>
              <div className="text-4xl md:text-6xl text-teal-500 font-serif leading-none text-right mt-1" style={{ lineHeight: '0.5' }}>
                &rdquo;
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section - Redesigned to match UpstreamTarget theme */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Tab Buttons - Matching UpstreamTarget style */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeTab === 'portfolio'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Accelerate Portfolio High-Grading
            </button>
            <button
              onClick={() => setActiveTab('barrels')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeTab === 'barrels'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100' 
                }
              `}
            >
              Deliver Advantaged Barrels
            </button>
          </div>

          {/* Tab Content Area - Gradient background with grey/black text */}
          <div className="p-4 md:p-6 bg-gradient-to-br from-blue-900 via-teal-800 to-teal-700 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'portfolio' && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {/* Header */}
                  <p className="text-base md:text-lg text-white mb-4 leading-relaxed">
                    Accelerate Portfolio High-Grading means actively reshaping our portfolio to focus on the assets that create the most value, with the discipline to divest or withdraw from those that are not value-accretive.
                  </p>
                  
                  {/* Divider */}
                  <div className="h-px bg-gray-400 mb-6"></div>

                  {/* Portfolio Items */}
                  <div className="space-y-4">
                    {portfolioItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="bg-white rounded-lg p-3 md:p-4 shadow-md border border-gray-300"
                      >
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-700 text-sm md:text-base flex items-start">
                          <span className="text-gray-800 mr-2 mt-1">►</span>
                          <span>{item.description}</span>
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Button to open 10 Shifts popup */}
                  <div className="text-center mt-6">
                    <motion.button
                      onClick={() => setIsPopupOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-200 text-sm md:text-base"
                    >
                      Click here to see 10 Shifts
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'barrels' && (
                <motion.div
                  key="barrels"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {/* Header */}
                  <p className="text-base md:text-lg text-white mb-4 leading-relaxed">
                    Deliver Advantaged Barrels means improving our internal efficiencies by focusing on safe, low cost, low carbon and high-margin barrels, through:
                  </p>
                  
                  {/* Divider */}
                  <div className="h-px bg-gray-400 mb-6"></div>

                  {/* Barrels Sections */}
                  <div className="space-y-5">
                    {barrelsSections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15, duration: 0.4 }}
                        className="bg-white rounded-lg p-3 md:p-4 shadow-md border border-gray-300"
                      >
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">{section.title}</h3>
                        <ul className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-700 text-sm md:text-base flex items-start">
                              <span className="text-gray-800 mr-2 mt-1">►</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Button to open 10 Shifts popup */}
                  <div className="text-center mt-6">
                    <motion.button
                      onClick={() => setIsPopupOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-200 text-sm md:text-base"
                    >
                      Click here to see 10 Shifts
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 10 Shifts Popup Overlay */}
      <AnimatePresence>
        {isPopupOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPopupOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4"
            >
              {/* Popup Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] relative flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="absolute top-4 right-4 z-20 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors shadow-lg"
                  aria-label="Close popup"
                >
                  <FaTimes className="text-gray-700 text-xl" />
                </button>

                {/* Popup Content - Using Image */}
                <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-white" style={{ maxHeight: 'calc(90vh - 2rem)' }}>
                  <Image
                    src="/key-shifts-10-shifts-flow.png"
                    alt="10 Shifts - Differentiated outcomes for 30% value improvement by 2035"
                    width={1200}
                    height={1800}
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                {/* COMMENTED OUT: Code-based 10 Shifts content - kept for reference
                <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-white" style={{ maxHeight: 'calc(90vh - 2rem)' }}>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">10 Shifts</h2>
                  
                  <p className="text-sm md:text-base text-gray-700 mb-4 text-center leading-relaxed">
                    The 10 Shifts define the differentiated outcomes that Upstream is pursuing to achieve 30% value improvement by 2035, with added focus on accelerating time-to-value and increasing the size of value.
                  </p>

                  <div className="flex items-center justify-center mb-4 bg-green-600 rounded-lg p-2">
                    <div className="flex items-center gap-1 md:gap-2 text-white font-semibold text-xs md:text-sm">
                      <span>EXPLORATION</span>
                      <span className="text-green-300">••••••</span>
                      <span>►</span>
                      <span>DEVELOPMENT</span>
                      <span className="text-green-300">••••••</span>
                      <span>►</span>
                      <span>PRODUCTION</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-700">
                      <FaClock className="text-gray-700 text-sm" />
                      <span>Accelerate Time-to-Value</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700">
                      <FaChartLine className="text-gray-700 text-sm" />
                      <span>Enhance value</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {tenShifts.map((shift, index) => (
                      <motion.div
                        key={shift.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0">
                            <span className="text-lg font-bold text-gray-800">{shift.id}.</span>
                          </div>
                          <div className="flex-grow">
                            <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                              {shift.text.includes('**') ? (
                                shift.text.split('**').map((part, i) => 
                                  i % 2 === 1 ? (
                                    <strong key={i} className="text-gray-900">{part}</strong>
                                  ) : (
                                    <span key={i}>{part}</span>
                                  )
                                )
                              ) : (
                                shift.text
                              )}
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex gap-1">
                            {shift.icons.includes('time') && (
                              <FaClock className="text-gray-700 text-sm" />
                            )}
                            {shift.icons.includes('value') && (
                              <FaChartLine className="text-gray-700 text-sm" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-gray-800 text-sm md:text-base font-semibold">
                      Safe, Focused portfolio through accelerated portfolio high-grading, Highly efficient, and AI-enabled operations.
                    </p>
                  </div>
                </div>
                */}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
