// src/components/LoadingAnimation.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Loading Animation Component
 * 
 * Displays an animated text reveal that spells out "UPSTREAMBUZZ" letter by letter
 * Inspired by phamilypharma.com loading effect
 */
export default function LoadingAnimation() {
  const [isVisible, setIsVisible] = useState(true);
  const text = "UPSTREAMBUZZ";
  const letters = text.split('');

  useEffect(() => {
    // Hide after animation completes (approximately 2 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="flex gap-1 md:gap-2 justify-center items-center">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-teal-200 text-lg md:text-xl mt-4"
            >
              Your Source for PETRONAS Upstream Stories & Insights
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

