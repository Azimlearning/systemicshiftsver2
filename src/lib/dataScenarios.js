// src/lib/dataScenarios.js
/**
 * Data Scenario Management
 * 
 * Utilities for managing and switching between different data scenarios
 * for StatsX dashboard presentation and testing
 */

import { generateAllFakeData, clearTestData as clearTestDataFromFakeData, DATA_SCENARIOS } from './generateFakeData';

/**
 * Clear all test data
 * Wrapper function that re-exports clearTestData from generateFakeData
 * @param {Array<string>} collections - Collections to clear
 * @returns {Promise<object>} Clear results
 */
export async function clearTestData(collections) {
  return await clearTestDataFromFakeData(collections);
}

/**
 * Get available scenarios
 * @returns {Array} List of available scenarios
 */
export function getAvailableScenarios() {
  return Object.keys(DATA_SCENARIOS).map(key => ({
    key,
    ...DATA_SCENARIOS[key],
  }));
}

/**
 * Get scenario configuration
 * @param {string} scenarioKey - Scenario key
 * @returns {object} Scenario configuration
 */
export function getScenarioConfig(scenarioKey) {
  return DATA_SCENARIOS[scenarioKey] || DATA_SCENARIOS.normal;
}

/**
 * Generate data for a specific scenario
 * @param {string} scenarioKey - Scenario to generate
 * @param {boolean} clearFirst - Clear existing data first
 * @returns {Promise<object>} Generation results
 */
export async function loadScenario(scenarioKey, clearFirst = false) {
  if (clearFirst) {
    console.log('Clearing existing test data...');
    await clearTestDataFromFakeData();
  }

  console.log(`Generating data for scenario: ${scenarioKey}`);
  const results = await generateAllFakeData(scenarioKey);
  
  return results;
}

/**
 * Switch between scenarios (clear and regenerate)
 * @param {string} fromScenario - Current scenario
 * @param {string} toScenario - Target scenario
 * @returns {Promise<object>} Generation results
 */
export async function switchScenario(fromScenario, toScenario) {
  console.log(`Switching from ${fromScenario} to ${toScenario}`);
  
  // Clear existing data
  await clearTestDataFromFakeData();
  
  // Generate new scenario
  const results = await generateAllFakeData(toScenario);
  
  return results;
}

/**
 * Export scenario data for backup
 * @param {string} scenarioKey - Scenario to export
 * @returns {Promise<object>} Exported data
 */
export async function exportScenarioData(scenarioKey) {
  // This would export the current Firestore data
  // Implementation depends on your needs
  console.log(`Exporting data for scenario: ${scenarioKey}`);
  // TODO: Implement data export
  return {};
}

/**
 * Import scenario data
 * @param {string} scenarioKey - Scenario to import
 * @param {object} data - Data to import
 * @returns {Promise<boolean>} Success status
 */
export async function importScenarioData(scenarioKey, data) {
  // This would import data into Firestore
  console.log(`Importing data for scenario: ${scenarioKey}`);
  // TODO: Implement data import
  return true;
}

