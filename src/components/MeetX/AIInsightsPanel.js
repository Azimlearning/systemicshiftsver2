// src/components/MeetX/AIInsightsPanel.js
'use client';

import { useState } from 'react';
import { FaBrain, FaExclamationTriangle, FaCheckCircle, FaTasks, FaGhost } from 'react-icons/fa';

export default function AIInsightsPanel({ meeting }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const insights = meeting.aiInsights || {};
  const hasInsights = meeting.summary || insights.cascadingSummary || 
                      (insights.alignmentWarnings && insights.alignmentWarnings.length > 0) ||
                      (insights.actionItems && insights.actionItems.length > 0);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!hasInsights) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBrain className="text-teal-600" /> AI Insights
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>AI insights are being generated...</p>
          <p className="text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FaBrain className="text-teal-600" /> AI Insights
      </h2>

      <div className="space-y-4">
        {/* Feature A: Summary */}
        {meeting.summary && (
          <div className="border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => toggleSection('summary')}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaCheckCircle className="text-teal-600" /> Summary
              </h3>
              <span className="text-gray-500">{expandedSection === 'summary' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'summary' && (
              <div className="mt-3 text-gray-700 whitespace-pre-wrap">
                {meeting.summary}
              </div>
            )}
          </div>
        )}

        {/* Feature B: Cascading Summary */}
        {insights.cascadingSummary && (
          <div className="border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => toggleSection('cascading')}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaBrain className="text-blue-600" /> Contextual Analysis
              </h3>
              <span className="text-gray-500">{expandedSection === 'cascading' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'cascading' && (
              <div className="mt-3 text-gray-700 whitespace-pre-wrap">
                {insights.cascadingSummary}
              </div>
            )}
          </div>
        )}

        {/* Feature C: Alignment Warnings */}
        {insights.alignmentWarnings && insights.alignmentWarnings.length > 0 && (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <button
              onClick={() => toggleSection('alignment')}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-600" /> Alignment Warnings
                <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                  {insights.alignmentWarnings.length}
                </span>
              </h3>
              <span className="text-gray-500">{expandedSection === 'alignment' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'alignment' && (
              <div className="mt-3 space-y-2">
                {insights.alignmentWarnings.map((warning, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">{warning.type}</p>
                    <p className="text-sm text-gray-700 mt-1">{warning.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature D: Action Items */}
        {insights.actionItems && insights.actionItems.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => toggleSection('actions')}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaTasks className="text-purple-600" /> Action Items
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {insights.actionItems.length}
                </span>
              </h3>
              <span className="text-gray-500">{expandedSection === 'actions' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'actions' && (
              <div className="mt-3 space-y-3">
                {insights.actionItems.map((item, idx) => {
                  const isZombie = !item.owner || !item.dueDate;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        isZombie
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.task}</p>
                          <div className="mt-1 text-sm text-gray-600 space-y-1">
                            {item.owner && <p>Owner: {item.owner}</p>}
                            {item.dueDate && <p>Due: {item.dueDate}</p>}
                            {item.status && <p>Status: {item.status}</p>}
                          </div>
                        </div>
                        {isZombie && (
                          <FaGhost className="text-red-600 ml-2" title="Zombie Task - Missing owner or due date" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Zombie Tasks List */}
        {insights.zombieTasks && insights.zombieTasks.length > 0 && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <FaGhost className="text-red-600" /> Zombie Tasks Detected
              <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                {insights.zombieTasks.length}
              </span>
            </h3>
            <div className="space-y-2">
              {insights.zombieTasks.map((task, idx) => (
                <div key={idx} className="bg-white p-2 rounded text-sm text-gray-700">
                  {task}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

