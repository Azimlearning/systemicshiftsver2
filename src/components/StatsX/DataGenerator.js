// src/components/StatsX/DataGenerator.js
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDatabase, FaTrash, FaDownload, FaUpload, FaSpinner } from 'react-icons/fa';
import { getAvailableScenarios, loadScenario, clearTestData } from '../../lib/dataScenarios';

/**
 * Data Generator Component for StatsX
 * Allows switching between data scenarios for presentation/testing
 */
export default function DataGenerator() {
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('normal');
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const scenarios = getAvailableScenarios();

  const handleGenerate = async (clearFirst = false) => {
    setLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const result = await loadScenario(selectedScenario, clearFirst);
      setLastResult(result);
      alert(`Data generated successfully!\n\nStories: ${result.stories}\nMeetings: ${result.meetings}\nAnalytics: ${result.analytics}`);
    } catch (err) {
      setError(err.message);
      console.error('Error generating data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all test data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await clearTestData();
      alert(`Test data cleared!\n\n${JSON.stringify(result.cleared, null, 2)}`);
    } catch (err) {
      setError(err.message);
      console.error('Error clearing data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <FaDatabase className="text-purple-600 text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Data Generator</h3>
          <p className="text-sm text-gray-700">Generate test data scenarios</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Scenario Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Scenario
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
            disabled={loading}
          >
            {scenarios.map((scenario) => (
              <option key={scenario.key} value={scenario.key}>
                {scenario.name} - {scenario.description}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerate(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaDatabase />
                Generate Data
              </>
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            title="Clear existing data and generate new"
          >
            <FaTrash />
            Clear & Generate
          </button>
        </div>

        <button
          onClick={handleClear}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaTrash />
          Clear All Test Data
        </button>

        {/* Results */}
        {lastResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Generation Results</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>Stories: {lastResult.stories}</p>
              <p>Meetings: {lastResult.meetings}</p>
              <p>Analytics: {lastResult.analytics}</p>
              {lastResult.articleEngagement > 0 && (
                <p>Article Engagement: {lastResult.articleEngagement} articles</p>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">Error: {error}</p>
          </div>
        )}

        {/* Warning */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Warning:</strong> This will modify your Firestore database. Use only in development/testing environments.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
