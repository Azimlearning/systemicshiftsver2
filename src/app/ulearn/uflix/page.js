// src/app/ulearn/uflix/page.js
'use client';

import { FaVideo, FaClock } from 'react-icons/fa';

export default function UflixPage() {
  return (
    <section className="bg-white p-12 rounded-lg shadow-lg">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-100 p-6 rounded-full">
            <FaVideo className="text-purple-600 text-6xl" />
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Uflix</h2>
        <p className="text-xl text-gray-600 mb-6">
          Video learning platform featuring Systemic Shifts Unplugged and other educational content.
        </p>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <FaClock />
          <span className="text-lg font-medium">Coming Soon</span>
        </div>
        <p className="text-gray-500 mt-4">
          Interactive video learning platform is currently under development. Check back soon!
        </p>
      </div>
    </section>
  );
}

