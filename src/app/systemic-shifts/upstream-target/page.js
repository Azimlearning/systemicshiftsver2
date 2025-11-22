// src/app/systemic-shifts/upstream-target/page.js
'use client';

import { useState, useEffect } from 'react';
import UpstreamTarget from '../../../components/UpstreamTarget';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function UpstreamTargetPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure component is mounted before rendering heavy component
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Loading Upstream Target...</p>
        </div>
      </div>
    );
  }

  return (
    <FadeInWhenVisible key="upstream-target">
      <section id="upstream-target">
        <UpstreamTarget />
      </section>
    </FadeInWhenVisible>
  );
}

