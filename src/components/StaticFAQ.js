// src/components/StaticFAQ.js
'use client';
import { FaLightbulb, FaBook, FaUsers, FaChartLine } from 'react-icons/fa'; // Example icons

// Helper component for the prompt buttons
const PromptButton = ({ icon, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full h-full p-4 text-left text-gray-200 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors"
  >
    <div className="flex items-center gap-3">
      <span className="text-teal-400">{icon}</span>
      <div className="flex flex-col">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-gray-400">{subtitle}</span>
      </div>
    </div>
  </button>
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
          <h3 className="text-3xl font-bold text-white mb-8 text-center">How can NexusGPT help you today?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, i) => (
                <PromptButton
                    key={i}
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
