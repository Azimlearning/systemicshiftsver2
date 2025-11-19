// src/components/OurProgress.js
'use client'; // This component uses useState and is interactive

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Our Progress Component
 * 
 * Features:
 * - Tab interface matching KeyShifts and MindsetBehaviour styling
 * - Framer Motion animations for smooth transitions
 * - Quarterly progress content displayed as images
 */

export default function OurProgress() {
  const [activeQuarter, setActiveQuarter] = useState('Q1'); // Default to Q1

  return (
    <section id="our-progress" className="bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Banner Text */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-2xl font-light text-gray-200 leading-relaxed mb-6">
            Step inside to explore the progress, milestones, and ideas shaping our journey
          </p>
        </div>

        {/* Tabs Section - Matching KeyShifts and MindsetBehaviour theme */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Tab Buttons - Matching KeyShifts style */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveQuarter('Q1')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeQuarter === 'Q1'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Q1
            </button>
            <button
              onClick={() => setActiveQuarter('Q2')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeQuarter === 'Q2'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Q2
            </button>
            <button
              onClick={() => setActiveQuarter('Q3')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeQuarter === 'Q3'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Q3
            </button>
            <button
              onClick={() => setActiveQuarter('Q4')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeQuarter === 'Q4'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Q4
            </button>
          </div>

          {/* Tab Content Area - White background for images */}
          <div className="p-6 md:p-8 bg-white min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeQuarter === 'Q1' && (
                <motion.div
                  key="q1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex items-center justify-center"
                >
                  <Image
                    src="/progress-q1-content.png"
                    alt="Q1 2025 Progress Milestones & Achievements"
                    width={1200}
                    height={1800}
                    className="w-full h-auto rounded-lg"
                  />
                </motion.div>
              )}

              {activeQuarter === 'Q2' && (
                <motion.div
                  key="q2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex items-center justify-center"
                >
                  <div className="text-center text-gray-600">
                    <h3 className="text-3xl font-bold mb-4">Q2 Progress</h3>
                    <p className="text-xl">Content for Q2 Milestones & Achievements will go here!</p>
                    <p className="mt-4">Please upload `progress-q2-content.png` once available.</p>
                  </div>
                </motion.div>
              )}

              {activeQuarter === 'Q3' && (
                <motion.div
                  key="q3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex items-center justify-center"
                >
                  <div className="text-center text-gray-600">
                    <h3 className="text-3xl font-bold mb-4">Q3 Progress</h3>
                    <p className="text-xl">Currently in progress...</p>
                  </div>
                </motion.div>
              )}

              {activeQuarter === 'Q4' && (
                <motion.div
                  key="q4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex items-center justify-center"
                >
                  <div className="text-center text-gray-600">
                    <h3 className="text-3xl font-bold mb-4">Q4 Progress</h3>
                    <p className="text-xl">Currently in progress...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}