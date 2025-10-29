// src/components/HeroSection.js
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-gradient-to-br from-teal-800 to-teal-900 py-16 md:py-24 text-white">
      {/* Background waves/texture */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/waves-bg.png" // Placeholder
          alt="Background waves"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
          UPSTREAMBUZZ
        </h1>
        <p className="text-xl md:text-2xl text-cyan-200 mb-10 animate-fade-in-up delay-200">
          Your Source for PETRONAS Upstream Stories & Insights
        </p>

        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl border border-teal-600 mb-12 animate-fade-in-up delay-400">
          <h3 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-4">Systemic Shifts Highlights</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* --- UPDATED Placeholder Image Area --- */}
            <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-lg overflow-hidden shadow-md border border-teal-500 flex-shrink-0 bg-gray-300 flex items-center justify-center text-gray-600 italic">
               Image Placeholder
            </div>
            {/* --- END UPDATE --- */}
            <div className="text-left md:w-2/3">
              <p className="text-lg text-gray-100 font-semibold mb-2">Innovation at Scale: Real-Time Optimisation</p>
              <p className="text-md text-gray-300 mb-4 line-clamp-3">
                Discover how our teams are leveraging cutting-edge technology for real-time optimisation, driving efficiency and sustainability across our upstream operations...
              </p>
              <Link href="#our-progress" className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
                Read More
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-600">
          {/* --- NEW BUTTON --- */}
          <Link
            href="/login" // Link to the login page first
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-teal-800 font-bold py-3 px-8 rounded-full transition-colors shadow-lg text-lg border border-white border-opacity-30"
          >
            Documents
          </Link>
          {/* --- END NEW BUTTON --- */}

          <Link href="#submit-stories" className="bg-cyan-500 hover:bg-cyan-600 text-teal-900 font-bold py-3 px-8 rounded-full transition-colors shadow-lg text-lg">
            Submit Your Story
          </Link>
          <Link
            href="#key-shifts"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg text-lg border border-white border-opacity-30"
          >
            Explore Key Shifts
          </Link>
        </div>
      </div>
    </section>
  );
}
