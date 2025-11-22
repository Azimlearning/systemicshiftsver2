// src/app/petronas-2.0/page.js
'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Petronas20Articles from '../../components/Petronas20Articles';
import Footer from '../../components/Footer';

export default function Petronas20Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give components time to mount and render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-gray-600">Loading content...</p>
            </div>
          </div>
        ) : (
          <>
            <section id="petronas-2.0">
              <Hero />
            </section>
            
            {/* Featured Articles Section */}
            <Petronas20Articles />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

