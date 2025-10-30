// src/components/Header.js
'use client';

import Link from 'next/link';
import Image from 'next/image'; // <-- NEW
import { useState, useEffect } from 'react';

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { name: 'Home', href: '/#home' },
    { name: 'Upstream Target', href: '/#upstream-target' },
    { name: 'Key Shifts', href: '/#key-shifts' },
    { name: 'Mindset & Behaviour', href: '/#mindset-behaviour' },
    { name: 'Our Progress', href: '/#our-progress' },
    { name: 'NexusHub', href: '/nexushub' },
    { name: 'NexusGPT', href: '/nexusgpt' },
    { name: 'Submit Stories', href: '/submit-story' },
  ];

  // Scroll tracking effect (no changes needed here)
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = '';
      navItems.forEach((item) => {
        if (item.href.startsWith('/#')) {
          const sectionId = item.href.substring(2);
          const section = document.getElementById(sectionId);
          if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 80 && rect.bottom >= 80) {
              currentSection = item.name;
            }
          }
        }
      });
      if (!currentSection) {
          const homeSection = document.getElementById('home');
          if (homeSection && homeSection.getBoundingClientRect().top <= 80) {
              currentSection = 'Home';
          }
      }
      setActiveSection(currentSection);
    };
    
    if (window.location.pathname === '/') {
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    return () => {
        if (window.location.pathname === '/') {
            window.removeEventListener('scroll', handleScroll);
        }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center h-16 md:h-20 px-4">
        {/* --- LOGO --- */}
        <Link href="/#home" className="flex-shrink-0">
            <Image
              src="/Systemic-Shifts-Logo/systemic-shifts-logo-Solid.png"
              alt="Systemic Shifts Logo"
              width={180} // A good starting width
              height={36} // Maintain aspect ratio
              priority // Load the logo first
            />
        </Link>
        {/* --- END LOGO --- */}

        {/* --- NAVIGATION --- */}
        {/* Hide nav on mobile, show on medium screens and up */}
        <nav className="hidden md:flex items-center"> 
          {navItems.map((item) => {
            const isCurrentPage = typeof window !== 'undefined' && window.location.pathname === item.href;
            const isScrollActive = item.href.startsWith('/#') && item.name === activeSection;
            const isActive = isCurrentPage || isScrollActive;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center justify-center h-full px-3 lg:px-4
                  text-center text-sm font-semibold transition-all duration-200 ease-in-out
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
        {/* --- END NAVIGATION --- */}
        
        {/* --- MOBILE MENU PLACEHOLDER --- */}
        <div className="md:hidden">
            {/* A hamburger menu icon would go here for mobile */}
            <button className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
        </div>
      </div>
    </header>
  );
}
