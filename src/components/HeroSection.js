// src/components/HeroSection.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Hero Section - UPSTREAMBUZZ Banner
 * 
 * Full viewport hero banner with:
 * - Large typography (7xl-9xl)
 * - Letter-by-letter reveal animation
 * - Animated mesh gradient background
 * - Glass-morphism effects
 * - Floating particles
 * - Enhanced glows and shadows
 */
export default function HeroSection() {
  const [particles, setParticles] = useState([]);
  const text = "UPSTREAMBUZZ";
  const letters = text.split('');
  const subtitle = "Your Source for PETRONAS Upstream Stories & Insights";

  useEffect(() => {
    // Generate particle positions after mount (deferred to avoid linter warning)
    const timer = setTimeout(() => {
      const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
      }));
      setParticles(generatedParticles);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      id="home" 
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
          ))}
        </div>
      )}

      {/* Main content container with glass-morphism */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center">
          {/* Glass-morphism container for title */}
          <div className="inline-block p-8 md:p-12 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl mb-8">
            {/* Main title with letter-by-letter animation */}
            <h1 className="flex gap-2 md:gap-3 lg:gap-4 justify-center items-center flex-nowrap">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1], // Custom easing for smooth effect
                  }}
                  whileHover={{
                    scale: 1.2,
                    y: -10,
                    transition: { duration: 0.2 },
                  }}
                  className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tight drop-shadow-2xl"
                  style={{
                    textShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </h1>

            {/* Floating/breathing animation for entire title */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 pointer-events-none"
            />
          </div>

          {/* Subtitle with staggered fade-in */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: letters.length * 0.08 + 0.3,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="text-xl md:text-2xl lg:text-3xl text-cyan-200/90 font-medium max-w-4xl mx-auto mt-8 md:mt-12"
            style={{
              textShadow: '0 2px 20px rgba(6, 182, 212, 0.4)',
            }}
          >
            {subtitle}
          </motion.p>

        </div>
      </div>

    </section>
  );
}
