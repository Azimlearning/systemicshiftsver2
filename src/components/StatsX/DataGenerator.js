// src/components/StatsX/DataGenerator.js
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDatabase, FaSpinner } from 'react-icons/fa';
import { generateAllFakeData } from '../../lib/generateFakeData';

/**
 * Admin panel component for generating fake data
 */
export default function DataGenerator() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    storiesCount: 50,
    meetingsCount: 30,
    analyticsCount: 200,
    daysBack: 30,
  });

  const handleGenerate = async () => {
    if (generating) return;

    setGenerating(true);
    setError(null);
    setResults(null);

    try {
      const result = await generateAllFakeData(options);
      setResults(result);
      
      // Refresh page after 2 seconds to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error generating fake data:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-4">
        <FaDatabase className="text-teal-600" />
        <h3 className="text-lg font-bold text-gray-900">Fake Data Generator</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Generate realistic fake data for testing dashboard visuals. Data will be added to your Firestore collections.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stories</label>
          <input
            type="number"
            value={options.storiesCount}
            onChange={(e) => setOptions({ ...options, storiesCount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            min="0"
            max="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meetings</label>
          <input
            type="number"
            value={options.meetingsCount}
            onChange={(e) => setOptions({ ...options, meetingsCount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            min="0"
            max="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Analytics</label>
          <input
            type="number"
            value={options.analyticsCount}
            onChange={(e) => setOptions({ ...options, analyticsCount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            min="0"
            max="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Days Back</label>
          <input
            type="number"
            value={options.daysBack}
            onChange={(e) => setOptions({ ...options, daysBack: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            min="7"
            max="365"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full md:w-auto px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <FaSpinner className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FaDatabase />
            Generate Fake Data
          </>
        )}
      </button>

      {results && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-800 mb-2">Generation Complete:</p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>Stories: {results.stories} generated</li>
            <li>Meetings: {results.meetings} generated</li>
            <li>Analytics: {results.analytics} generated</li>
          </ul>
          {results.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-600">
              Errors: {results.errors.join(', ')}
            </div>
          )}
          <p className="text-xs text-green-600 mt-2">Page will refresh in 2 seconds...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">Error: {error}</p>
        </div>
      )}
    </motion.div>
  );
}

