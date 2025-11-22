// src/app/statsx/page.js
// Note: NO 'use client' here. This is a Server Component.

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StatsDashboard from '../../components/StatsX/StatsDashboard';
import { getAllDashboardData } from '../../lib/statsData';

// This ensures the data is fresh on every request
export const dynamic = 'force-dynamic';

export default async function StatsXPage() {
  let data = null;
  let error = null;

  try {
    // Server-side fetch
    data = await getAllDashboardData();
  } catch (err) {
    console.error('Error fetching data:', err);
    error = err.message || 'Failed to load dashboard data';
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">StatsX Analytics</h1>
            <p className="text-gray-500 text-lg">Comprehensive analytics dashboard with AI-powered insights</p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mb-6 shadow-sm">
              <p className="text-red-800">Error loading dashboard data: {error}</p>
            </div>
          ) : (
            <StatsDashboard initialData={data} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
