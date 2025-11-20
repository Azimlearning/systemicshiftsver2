// src/components/StaticFAQ.js
'use client';
import { motion } from 'framer-motion';
import { FaLightbulb, FaBook, FaUsers, FaChartLine } from 'react-icons/fa'; // Example icons

// Helper component for the prompt buttons
const PromptButton = ({ icon, title, subtitle, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
    whileHover={{ scale: 1.05, y: -4 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="w-full h-full p-5 text-left text-gray-200 bg-gray-700 bg-opacity-50 rounded-xl hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl border border-gray-600/50 hover:border-teal-500/50"
  >
    <div className="flex items-center gap-4">
      <motion.span
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="text-teal-400 text-2xl"
      >
        {icon}
      </motion.span>
      <div className="flex flex-col">
        <span className="font-semibold text-base mb-1">{title}</span>
        <span className="text-sm text-gray-400">{subtitle}</span>
      </div>
    </div>
  </motion.button>
);

// This component now accepts a prop: `onQuestionClick`
export default function StaticFAQ({ onQuestionClick }) {
    
    const questions = [
        { 
          icon: <FaLightbulb />, 
          title: "Explain PETRONAS's Net Zero Carbon Emissions by 2050 goal.", 
          subtitle: "Click to ask the assistant" 
        },
        { 
          icon: <FaBook />, 
          title: "What are the 'Systemic Shifts'?", 
          subtitle: "Click to ask the assistant" 
        },
        { 
          icon: <FaUsers />, 
          title: "How can I contribute to the 'Upstream Target'?", 
          subtitle: "Click to ask the assistant" 
        },
        { 
          icon: <FaChartLine />, 
          title: "Summarize the latest progress report.", 
          subtitle: "Click to ask the assistant" 
        },
    ];

    return (
        <div className="p-6">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-10 text-center"
          >
            How can NexusGPT help you today?
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {questions.map((q, i) => (
                <PromptButton
                    key={i}
                    index={i}
                    icon={q.icon}
                    title={q.title}
                    subtitle={q.subtitle}
                    onClick={() => onQuestionClick(q.title)} // Send the title as the prompt
                />
            ))}
          </div>
        </div>
    );
}
