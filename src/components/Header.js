// src/components/Header.js
'use client'; // Still needed for scroll tracking

import Link from 'next/link';
// REMOVED Image import as we are not using images anymore
import { useState, useEffect } from 'react';

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Upstream Target', href: '#upstream-target' },
    { name: 'Key Shifts', href: '#key-shifts' },
    { name: 'Mindset & Behaviour', href: '#mindset-behaviour' },
    { name: 'Our Progress', href: '#our-progress' },
    { name: 'Collaterals', href: '#collaterals' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Submit Stories', href: '#submit-stories' },
  ];

  // Scroll tracking effect (unchanged)
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = 'home';
      navItems.forEach((item) => {
        const section = document.getElementById(item.href.substring(1));
        if (section) {
          const rect = section.getBoundingClientRect();
          // Adjust top offset if header height changes (e.g., 80px)
          if (rect.top <= 80 && rect.bottom >= 80) {
            currentSection = item.name;
          }
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check on load
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]); // Added navItems dependency

  return (
    // Sticky header with background gradient and shadow
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 shadow-lg">
      <nav className="container mx-auto flex justify-center items-center h-16 md:h-20">
        {navItems.map((item) => {
          const isActive = item.name === activeSection;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center justify-center h-full px-3 md:px-5 lg:px-6
                text-center text-sm md:text-base font-semibold transition-all duration-200 ease-in-out
                relative group whitespace-nowrap // Prevent wrapping
                ${isActive
                  ? 'text-white scale-105' // Active text style
                  : 'text-cyan-200 hover:text-white' // Inactive text style
                }
              `}
            >
              {/* Link Text */}
              {item.name}

              {/* Active Indicator (Underline) */}
              <span
                className={`
                  absolute bottom-0 left-0 w-full h-1 bg-cyan-300 rounded-t-full
                  transition-all duration-300 ease-out transform scale-x-0 group-hover:scale-x-100
                  ${isActive ? 'scale-x-100' : 'scale-x-0'}
                `}
              />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
