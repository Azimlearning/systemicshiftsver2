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
        <p className="text-xl md:text-2xl text-cyan-200 mb-12 animate-fade-in-up delay-200">
          Your Source for PETRONAS Upstream Stories & Insights
        </p>

        {/* Quick Stats Section - Replaces redundant highlights card */}
        <div className="max-w-4xl mx-auto animate-fade-in-up delay-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">30%</div>
              <div className="text-sm md:text-base text-gray-600">Value Improvement Target</div>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">2035</div>
              <div className="text-sm md:text-base text-gray-600">Vision Year</div>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">10</div>
              <div className="text-sm md:text-base text-gray-600">Key Shifts</div>
            </div>
            <div className="bg-white rounded-lg p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">3</div>
              <div className="text-sm md:text-base text-gray-600">Core Goals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
