// src/components/AIPoweredFeatures.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaGraduationCap,
  FaChartLine,
  FaUsers,
  FaImages,
  FaRobot,
  FaCloudUploadAlt,
  FaBolt,
  FaChevronRight
} from 'react-icons/fa';

/**
 * AI-Powered Features Component
 * Orbiting design with circular gradient cards orbiting around center logo
 */

const AI_FEATURES = [
  {
    id: 'dropbox',
    name: 'Systemic Shifts Dropbox',
    description: 'AI image and writeup generator',
    icon: FaCloudUploadAlt,
    href: '/nexushub/dropbox',
    gradient: 'from-teal-400 to-cyan-500',
    color: '#14b8a6',
    angle: 0,
    radius: 180,
  },
  {
    id: 'ulearn',
    name: 'ULearn',
    description: 'AI podcast to help learn',
    icon: FaGraduationCap,
    href: '/ulearn',
    gradient: 'from-blue-400 to-indigo-500',
    color: '#3b82f6',
    angle: 60,
    radius: 180,
  },
  {
    id: 'statsx',
    name: 'StatsX',
    description: 'AI monitoring and prediction',
    icon: FaChartLine,
    href: '/statsx',
    gradient: 'from-purple-400 to-pink-500',
    color: '#a855f7',
    angle: 120,
    radius: 180,
  },
  {
    id: 'meetx',
    name: 'MeetX',
    description: 'Organizing meetings with AI',
    icon: FaUsers,
    href: '/meetx',
    gradient: 'from-cyan-400 to-teal-500',
    color: '#06b6d4',
    angle: 180,
    radius: 180,
  },
  {
    id: 'gallery',
    name: 'Upstream Gallery',
    description: 'AI sorts the images for you',
    icon: FaImages,
    href: '/nexushub/upg',
    gradient: 'from-emerald-400 to-green-500',
    color: '#10b981',
    angle: 240,
    radius: 180,
  },
  {
    id: 'nexusgpt',
    name: 'NexusGPT',
    description: 'The core chatbot with upstream insights',
    icon: FaRobot,
    href: '/nexusgpt',
    gradient: 'from-orange-400 to-red-500',
    color: '#f97316',
    angle: 300,
    radius: 180,
  },
];

export default function AIPoweredFeatures() {
  const [rotation, setRotation] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Orbital rotation animation (only after mount)
  useEffect(() => {
    if (!mounted) return;
    
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 30);

    return () => clearInterval(rotationInterval);
  }, [mounted]);

  return (
    <div className="relative w-full py-12 md:py-16 bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50" suppressHydrationWarning>
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-20 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-300/50 mb-6">
          <FaBolt className="w-4 h-4 text-teal-600" />
          <span className="text-sm text-slate-700 font-medium">AI-Powered Platform</span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mb-3">
          Accelerate workflow using <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">AI</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
          Accelerating workflow harnessing the power of these 6 AI functions
        </p>
      </motion.div>

      {/* Main Container - Flex layout with cards on left and orbit on right */}
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
          
          {/* Left side - Feature Cards Stack */}
          <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1 flex-shrink-0">
            {AI_FEATURES.map((feature, index) => (
              <Link key={feature.id} href={feature.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`group relative p-5 rounded-2xl shadow-xl border cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                    hoveredCard === feature.id 
                      ? 'scale-105 shadow-2xl' 
                      : 'hover:scale-[1.02]'
                  }`}
                  style={{
                    background: hoveredCard === feature.id
                      ? `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`
                      : 'rgba(255, 255, 255, 0.8)',
                    borderColor: hoveredCard === feature.id ? feature.color : 'rgba(148, 163, 184, 0.3)',
                    boxShadow: hoveredCard === feature.id 
                      ? `0 10px 40px ${feature.color}60` 
                      : '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={() => setHoveredCard(feature.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div 
                      className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 ${
                        hoveredCard === feature.id ? 'scale-110 rotate-3' : ''
                      }`}
                    >
                      <feature.icon className="text-white w-7 h-7" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-base">{feature.name}</h3>
                        {hoveredCard === feature.id && (
                          <FaBolt className="w-3 h-3 text-teal-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>

                    {/* Arrow */}
                    <FaChevronRight 
                      className={`flex-shrink-0 w-5 h-5 text-slate-500 transition-all duration-300 ${
                        hoveredCard === feature.id ? 'translate-x-1 text-teal-600' : ''
                      }`}
                    />
                  </div>

                  {/* Hover glow effect */}
                  {hoveredCard === feature.id && (
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
                      style={{
                        background: `linear-gradient(135deg, ${feature.color}, transparent)`,
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right side - Orbital visualization */}
          <div className="relative w-full flex-1 order-1 lg:order-2">
            <div 
              className="relative rounded-3xl overflow-hidden p-8 md:p-12"
              style={{ 
                minHeight: '700px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Orbital System */}
              <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
                {/* Orbital rings with rotation */}
                <div 
                  className="absolute w-[320px] h-[320px] rounded-full"
                  style={{
                    border: '2px solid rgba(6, 182, 212, 0.2)',
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.1)',
                    transform: `rotate(${mounted ? rotation : 0}deg)`,
                    transition: mounted ? 'transform 0.05s linear' : 'none'
                  }}
                />
                <div 
                  className="absolute w-[420px] h-[420px] rounded-full"
                  style={{
                    border: '1px solid rgba(6, 182, 212, 0.1)',
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.05)',
                    transform: `rotate(${mounted ? -rotation * 0.5 : 0}deg)`,
                    transition: mounted ? 'transform 0.05s linear' : 'none'
                  }}
                />

                {/* Center Hub with Systemic Shifts Logo */}
                <div className="relative z-20">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl" />
                  
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                    className="relative w-48 h-48 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl border-4 border-white/50"
                    style={{
                      boxShadow: '0 20px 60px rgba(255, 255, 255, 0.3), inset 0 0 40px rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div className="relative w-36 h-36">
                      <Image
                        src="/Systemic-Shifts-Logo/systemic-shifts-logo-Solid.png"
                        alt="Systemic Shifts Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Orbiting Feature Indicators (smaller circles) */}
                {AI_FEATURES.map((feature) => {
                  const radius = 160;
                  const currentAngle = mounted ? feature.angle + rotation : feature.angle;
                  const radians = (currentAngle * Math.PI) / 180;
                  
                  const x = (Math.cos(radians) * radius).toFixed(3);
                  const y = (Math.sin(radians) * radius).toFixed(3);
                  
                  const isHovered = hoveredCard === feature.id;

                  return (
                    <div
                      key={feature.id}
                      className="absolute z-30 transition-all duration-300"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${isHovered ? 1.3 : 1})`,
                      }}
                      onMouseEnter={() => setHoveredCard(feature.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="relative">
                        {isHovered && (
                          <div 
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${feature.gradient} blur-xl opacity-70`}
                            style={{ transform: 'scale(2)' }}
                          />
                        )}
                        
                        <div 
                          className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} shadow-2xl flex items-center justify-center border-4 border-white/50 transition-all duration-300`}
                          style={{
                            boxShadow: isHovered 
                              ? `0 10px 40px ${feature.color}cc, inset 0 0 20px rgba(255,255,255,0.3)` 
                              : `0 5px 20px ${feature.color}88, inset 0 0 15px rgba(255,255,255,0.2)`
                          }}
                        >
                          <feature.icon className="text-white w-8 h-8 drop-shadow-2xl" />
                          
                          {isHovered && (
                            <div
                              className="absolute inset-0 rounded-full border-2 border-white/50"
                              style={{
                                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Connection lines to center */}
                {AI_FEATURES.map((feature) => {
                  const radius = 160;
                  const currentAngle = mounted ? feature.angle + rotation : feature.angle;
                  const radians = (currentAngle * Math.PI) / 180;
                  
                  const x = (Math.cos(radians) * radius).toFixed(3);
                  const y = (Math.sin(radians) * radius).toFixed(3);
                  
                  const isHovered = hoveredCard === feature.id;

                  return (
                    <svg
                      key={`line-${feature.id}`}
                      className="absolute top-1/2 left-1/2 pointer-events-none z-10"
                      style={{
                        width: '100%',
                        height: '100%',
                        transform: 'translate(-50%, -50%)',
                        opacity: isHovered ? 0.4 : 0.1,
                        transition: 'opacity 0.3s'
                      }}
                    >
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${x}px)`}
                        y2={`calc(50% + ${y}px)`}
                        stroke={feature.color}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}