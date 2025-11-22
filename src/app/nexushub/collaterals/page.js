// src/app/nexushub/collaterals/page.js
'use client';

import { useState, useEffect } from 'react';
import Collaterals from '../../../components/Collaterals';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function CollateralsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <FadeInWhenVisible key="collaterals">
      <section id="collaterals">
        <Collaterals />
      </section>
    </FadeInWhenVisible>
  );
}
