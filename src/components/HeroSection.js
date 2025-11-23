// src/components/HeroSection.js
'use client';

import Link from 'next/link';
import Image from 'next/image';
import AIPoweredFeatures from './AIPoweredFeatures';

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
        <p className="text-xl md:text-2xl text-cyan-200 mb-8 md:mb-12 animate-fade-in-up delay-200">
          Your Source for PETRONAS Upstream Stories & Insights
        </p>

        {/* AI-Powered Features Section */}
        <AIPoweredFeatures />
      </div>
    </section>
  );
}
