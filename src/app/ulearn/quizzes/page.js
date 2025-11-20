// src/app/ulearn/quizzes/page.js
'use client';

import { FaQuestionCircle, FaClock } from 'react-icons/fa';

export default function QuizzesPage() {
  return (
    <section className="bg-white p-12 rounded-lg shadow-lg">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-100 p-6 rounded-full">
            <FaQuestionCircle className="text-purple-600 text-6xl" />
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Quizzes</h2>
        <p className="text-xl text-gray-600 mb-6">
          Test your knowledge about Systemic Shifts and Upstream operations.
        </p>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <FaClock />
          <span className="text-lg font-medium">Coming Soon</span>
        </div>
        <p className="text-gray-500 mt-4">
          Interactive quizzes are currently under development. Check back soon!
        </p>
      </div>
    </section>
  );
}

