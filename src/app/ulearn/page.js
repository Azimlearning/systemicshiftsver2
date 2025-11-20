// src/app/ulearn/page.js
'use client';

import Link from 'next/link';
import { FaQuestionCircle, FaPodcast, FaGraduationCap } from 'react-icons/fa';

const UlearnLanding = () => (
  <div className="bg-white p-12 rounded-lg shadow-lg">
    <div className="text-center mb-8">
      <h2 className="text-4xl font-extrabold text-teal-700 mb-4 flex items-center justify-center gap-3">
        <FaGraduationCap />
        Welcome to Ulearn
      </h2>
      <p className="text-xl text-gray-600">
        Your educational hub for learning about Systemic Shifts and Upstream operations.
      </p>
      <p className="text-gray-600 mt-2">
        Explore videos, test your knowledge, and generate AI-powered podcasts.
      </p>
    </div>

    {/* Quick Links Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Quizzes Card */}
      <Link href="/ulearn/quizzes" className="group">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FaQuestionCircle className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">Quizzes</h3>
          </div>
          <p className="text-gray-700">
            Test your knowledge with interactive quizzes about Systemic Shifts and Upstream operations.
          </p>
        </div>
      </Link>

      {/* AI Podcast Generator Card */}
      <Link href="/ulearn/podcast" className="group">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FaPodcast className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-orange-700">AI Podcast</h3>
          </div>
          <p className="text-gray-700">
            Generate AI-powered podcasts on any topic related to Systemic Shifts and PETRONAS Upstream.
          </p>
        </div>
      </Link>
    </div>
  </div>
);

export default function UlearnPage() {
  return <UlearnLanding />;
}

