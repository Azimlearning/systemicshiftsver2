// src/components/MindsetBehaviour.js
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mindset & Behaviour Component
 * 
 * Features:
 * - Code-based content replacing images
 * - Tab interface matching KeyShifts styling
 * - Three tabs: More Risk Tolerant, Commercial Savvy, Growth Mindset
 * - Each tab contains: Philosophy, Application Examples, and Our Roles section
 * - Framer Motion animations for smooth transitions
 */

export default function MindsetBehaviour() {
  const [activeTab, setActiveTab] = useState('tolerant');

  // More Risk Tolerant data (Image 1)
  const riskTolerantData = {
    philosophy: "Sees CHANGE as strength in building culture of innovation, agility, and growth by adapting quickly to challenges. Stretch ourselves beyond comfort zones, and see failures as steps toward progress.",
    applicationExamples: [
      "The organisation continues to promote innovation and accept failure as lesson learnt. Openly admitting the gaps and working on resolution instead of finding fault."
    ],
    roles: [
      {
        id: 'learning',
        title: "Leaders Role Model a Learning Attitude.",
        description: "Openly reflect on mistakes, share learning journeys, and show humility in not knowing everything while reframe setbacks as growth opportunities.",
        image: "/SystemicShiftsDiagrams_pages/mindset-risk-tolerant-content.png"
      },
      {
        id: 'feedback',
        title: "Continue to Give Actionable Feedback.",
        description: "Offer constructive input focused on growth, not just evaluation and seek feedback without defensiveness; view it as a tool for self-growth.",
        image: "/mindset-risk-tolerant-content.png" // Placeholder
      },
      {
        id: 'comfort',
        title: "Challenge Comfort Zones.",
        description: "Push teams to take on new challenges and grow beyond the familiar and willingly take on unfamiliar tasks or roles to develop new capabilities as initiative to learn new skills.",
        image: "/mindset-risk-tolerant-content.png" // Placeholder
      }
    ]
  };

  // Commercial Savvy data (Image 2)
  const commercialSavvyData = {
    philosophy: "Value-driven decisions by focusing on where to play and how to win. Aligns strategy, operations, and innovation to market needs and business impact. Thinks like owners by balancing impact with resources and linking daily actions to long-term success.",
    applicationExamples: [
      "Leaders prioritise long term value in every decision made, whether it be in Upstream Portfolio Management or independent projects.",
      "To prioritise decision making which protects the value of the company over personal sentiments."
    ],
    roles: [
      {
        id: 'strategy',
        title: "Leaders to Set a Clear Value-Driven Strategy.",
        description: "Define and communicate where the business wins and how value is created. Focus resources on what drives growth or efficiency and stop low-value work.",
        image: "/SystemicShiftsDiagrams_pages/mindset-commercial-savvy-content.png"
      },
      {
        id: 'tradeoffs',
        title: "Make Smart Trade-Offs and Opportunity Oriented.",
        description: "Prioritise work that has the highest impact, find efficiencies, eliminate waste, suggest ways to grow and avoid perfectionism in low-value areas.",
        image: "/SystemicShiftsDiagrams_pages/mindset-commercial-savvy-content.png"
      },
      {
        id: 'owner',
        title: "Act Like an Owner.",
        description: "Develop business acumen in team, coach and mentor team to understand value chain and think beyond their function.",
        image: "/SystemicShiftsDiagrams_pages/mindset-commercial-savvy-content.png"
      }
    ]
  };

  // Growth Mindset data (Image 3)
  const growthMindsetData = {
    philosophy: "Embrace growth by enabling bold yet thoughtful decisions, encouraging innovation and impactful improvement. Empowered to take initiative within a safe environment, with leaders promoting experimentation, rewarding boldness, and viewing failure as progress.",
    applicationExamples: [
      "Business linking choice to Long-Term value be it in Upstream Portfolio Management or any independent projects.",
      "Leaders to celebrate any new ideas from the juniors without having bias and scepticism."
    ],
    roles: [
      {
        id: 'risk-taking',
        title: "Leaders to Role Model a Risk-Taking Attitude.",
        description: "Leaders to demonstrate bold and transparent decisions by showing how calculated risks are evaluated/taken.",
        image: "/SystemicShiftsDiagrams_pages/mindset-growth-mindset-content.png"
      },
      {
        id: 'speak-up',
        title: "Encourage Speak Up with Ideas.",
        description: "Encourage openness, accept honest mistakes, and protect those who take initiative by recognising both success and effort in experimentation and celebrate smart failures.",
        image: "/SystemicShiftsDiagrams_pages/mindset-growth-mindset-content.png"
      },
      {
        id: 'support',
        title: "Support Peers in Trying.",
        description: "Encourage teammates to take initiative, and create a safe space for experimentation.",
        image: "/SystemicShiftsDiagrams_pages/mindset-growth-mindset-content.png"
      }
    ]
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'tolerant':
        return riskTolerantData;
      case 'savvy':
        return commercialSavvyData;
      case 'growth':
        return growthMindsetData;
      default:
        return riskTolerantData;
    }
  };

  const currentData = getCurrentTabData();

  return (
    <section id="mindset-behaviour" className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Banner Text */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-3xl font-semibold text-teal-300 leading-relaxed mb-6">
            For Upstream to become <span className="font-extrabold">Fitter, Focused</span> and <span className="font-extrabold">Sharper</span>,<br />
            we require a <span className="font-extrabold">Mindset & Behaviour Shifts</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 uppercase">Desired Mindset</h2>
        </div>

        {/* Tabs Section - Redesigned to match KeyShifts theme */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Tab Buttons - Matching KeyShifts style */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('tolerant')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeTab === 'tolerant'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              More Risk Tolerant
            </button>
            <button
              onClick={() => setActiveTab('savvy')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeTab === 'savvy'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Commercial Savvy
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`
                flex-1 px-6 py-4 text-center font-semibold text-sm md:text-base transition-all duration-200
                ${activeTab === 'growth'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-100'
                }
              `}
            >
              Growth Mindset
            </button>
          </div>

          {/* Tab Content Area - Gradient background with white text */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-blue-900 via-teal-800 to-teal-700 min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* Philosophy/Description Section */}
                <div className="mb-8">
                  <p className="text-lg md:text-xl text-white leading-relaxed">
                    {currentData.philosophy}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-400 mb-8"></div>

                {/* Application Example Section */}
                <div className="mb-10">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Application Example</h3>
                  <ul className="space-y-3">
                    {currentData.applicationExamples.map((example, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="text-white text-base md:text-lg flex items-start"
                      >
                        <span className="text-white mr-3 mt-1">►</span>
                        <span>{example}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Our Roles Section */}
                <div className="mt-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-teal-300 text-center mb-8">Our Roles</h3>
                  
                  {/* Role Cards - White background with dark text */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {currentData.roles.map((role, index) => (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, duration: 0.4 }}
                        className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-200 flex flex-col items-center text-center"
                      >
                        {/* Circular Image */}
                        <div className="mb-4">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-teal-400 shadow-md">
                            <Image
                              src={role.image}
                              alt={role.title}
                              width={160}
                              height={160}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Role Title */}
                        <h4 className="text-lg md:text-xl font-bold text-teal-700 mb-3">
                          {role.title}
                        </h4>
                        
                        {/* Role Description */}
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          {role.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
