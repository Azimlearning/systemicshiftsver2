// src/components/Header.js
'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for mobile menu

export default function Header() {
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/#home' },
    { name: 'Upstream Target', href: '/#upstream-target' },
    { name: 'Key Shifts', href: '/#key-shifts' },
    { name: 'Mindset & Behaviour', href: '/#mindset-behaviour' },
    { name: 'Our Progress', href: '/#our-progress' },
    { name: 'NexusHub', href: '/nexushub' },
    { name: 'NexusGPT', href: '/nexusgpt' },
    { name: 'Ulearn', href: '/ulearn' },
    { name: 'Submit Stories', href: '/submit-story' },
  ];

  // Scroll tracking logic
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = '';
      navItems.forEach((item) => {
        if (!item.href.startsWith('/#')) return;
        const sectionId = item.href.substring(2);
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom >= 80) {
            currentSection = item.name;
          }
        }
      });
      setActiveSection(currentSection);
    };

    if (window.location.pathname === '/') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center h-16 md:h-20 px-4">
        
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
           <Image 
             src="/Systemic-Shifts-Logo/systemic-shifts-logo-BlackWhite.png" 
             alt="Systemic Shifts Logo"
             width={240}
             height={48}
             priority
             className="h-12 w-auto" // Ensure it sizes correctly
           />
        </Link>

        {/* Desktop Navigation (Hidden on mobile) */}
        <nav className="hidden md:flex justify-center items-center">
          {navItems.map((item) => {
            const isActive = activeSection === item.name;
            return (
              <Link
                key={item.name}
                href={item.href}
                suppressHydrationWarning={true}
                className={`
                  flex items-center justify-center h-full px-3 lg:px-4
                  text-center text-sm font-semibold transition-all duration-200 ease-in-out
                  relative group whitespace-nowrap
                  ${isActive ? 'text-white' : 'text-cyan-200 hover:text-white'}
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

        {/* Mobile Menu Button (Visible on mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-2xl p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Flyout --- */}
      {/* This slides in from the left and is guaranteed to be on top */}
      <div 
        className={`
          md:hidden fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95 z-[100]
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-6 pt-20">
           <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-5 right-5 text-white text-3xl p-2"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
          
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick} // Close menu on click
              className="text-cyan-200 hover:text-white text-2xl font-semibold"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
