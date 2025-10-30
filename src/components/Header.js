// src/components/Header.js
'use client'; // Still needed for scroll tracking

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Upstream Target', href: '#upstream-target' },
    { name: 'Key Shifts', href: '#key-shifts' },
    { name: 'Mindset & Behaviour', href: '#mindset-behaviour' },
    { name: 'Our Progress', href: '#our-progress' },
    // --- THIS LINE IS UPDATED ---
    { name: 'NexusHub', href: '/nexushub' }, // Was 'Collaterals'
    // --- END UPDATE ---
    { name: 'FAQ', href: '#faq' },
    { name: 'Submit Stories', href: '#submit-stories' },
  ];

  // Scroll tracking effect
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = '';
      navItems.forEach((item) => {
        // Only track scroll position for hash links
        if (item.href.startsWith('#')) {
          const section = document.getElementById(item.href.substring(1));
          if (section) {
            const rect = section.getBoundingClientRect();
            // Header height is approx 80px
            if (rect.top <= 80 && rect.bottom >= 80) {
              currentSection = item.name;
            }
          }
        }
      });
      // If no section is active (e.g., at the very top), default to Home
      if (!currentSection) {
          const homeSection = document.getElementById('home');
          if (homeSection && homeSection.getBoundingClientRect().top <= 80) {
              currentSection = 'Home';
          }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // navItems is static, no need to include

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 shadow-lg">
      <nav className="container mx-auto flex justify-center items-center h-16 md:h-20">
        {navItems.map((item) => {
          const isScrollLink = item.href.startsWith('#');
          const isActive = isScrollLink && item.name === activeSection;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center justify-center h-full px-3 md:px-5 lg:px-6
                text-center text-sm md:text-base font-semibold transition-all duration-200 ease-in-out
                relative group whitespace-nowrap
                ${isActive
                  ? 'text-white scale-105'
                  : 'text-cyan-200 hover:text-white'
                }
              `}
            >
              {item.name}
              <span
                className={`
                  absolute bottom-0 left-0 w-full h-1 bg-cyan-300 rounded-t-full
                  transition-all duration-300 ease-out transform
                  ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                `}
              />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
