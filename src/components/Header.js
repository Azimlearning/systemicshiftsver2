// src/components/Header.js
'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

/**
 * Header Component with Dropdown Navigation
 * 
 * Features:
 * - Home button links to landing page (Upstream Buzz)
 * - PETRONAS 2.0 button
 * - Systemic Shifts dropdown menu (Microsoft/Apple style)
 * - Second-level navigation appears when in Systemic Shifts section
 * - StatsX and MeetX placeholder buttons
 */
export default function Header() {
  const [isSystemicShiftsOpen, setIsSystemicShiftsOpen] = useState(false);
  const [isUlearnOpen, setIsUlearnOpen] = useState(false);
  const [isMeetXOpen, setIsMeetXOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const systemicShiftsDropdownRef = useRef(null);
  const ulearnDropdownRef = useRef(null);
  const meetXDropdownRef = useRef(null);
  const pathname = usePathname();

  // Check if we're in the Systemic Shifts section
  const isInSystemicShifts = pathname?.startsWith('/systemic-shifts');
  
  // Check if we're in the Ulearn section
  const isInUlearn = pathname?.startsWith('/ulearn');
  
  // Check if we're in the MeetX section
  const isInMeetX = pathname?.startsWith('/meetx');

  // Navigation items structure
  const navItems = [
    { name: 'Home', href: '/#home', type: 'link' },
    { name: 'PETRONAS 2.0', href: '/petronas-2.0', type: 'link' },
    { 
      name: 'Systemic Shifts', 
      href: '/systemic-shifts/upstream-target', 
      type: 'dropdown',
      subItems: [
        { name: 'Upstream Target', href: '/systemic-shifts/upstream-target' },
        { name: 'Key Shifts', href: '/systemic-shifts/key-shifts' },
        { name: 'Mindset & Behaviour', href: '/systemic-shifts/mindset-behaviour' },
        { name: 'Our Progress', href: '/systemic-shifts/our-progress' },
      ]
    },
    { name: 'Articles', href: '/articles', type: 'link' },
    { 
      name: 'Ulearn', 
      href: '/ulearn', 
      type: 'dropdown',
      subItems: [
        { name: 'Overview', href: '/ulearn' },
        { name: 'Quizzes', href: '/ulearn/quizzes' },
        { name: 'AI Podcast Generator', href: '/ulearn/podcast' },
      ]
    },
    { name: 'StatsX', href: '/statsx', type: 'link' },
    { 
      name: 'MeetX', 
      href: '/meetx', 
      type: 'dropdown',
      subItems: [
        { name: 'My Meetings', href: '/meetx' },
        { name: 'Shared with Me', href: '/meetx/shared' },
        { name: 'AI Insights', href: '/meetx/insights' },
      ]
    },
    { name: 'NexusHub', href: '/nexushub', type: 'link' },
    { name: 'NexusGPT', href: '/nexusgpt', type: 'link' },
    { name: 'Submit Stories', href: '/submit-story', type: 'link' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (systemicShiftsDropdownRef.current && !systemicShiftsDropdownRef.current.contains(event.target)) {
        setIsSystemicShiftsOpen(false);
      }
      if (ulearnDropdownRef.current && !ulearnDropdownRef.current.contains(event.target)) {
        setIsUlearnOpen(false);
      }
      if (meetXDropdownRef.current && !meetXDropdownRef.current.contains(event.target)) {
        setIsMeetXOpen(false);
      }
    };

    if (isSystemicShiftsOpen || isUlearnOpen || isMeetXOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSystemicShiftsOpen, isUlearnOpen, isMeetXOpen]);

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsSystemicShiftsOpen(false);
    setIsUlearnOpen(false);
    setIsMeetXOpen(false);
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
             className="h-12 w-auto"
           />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-center items-center gap-1">
          {navItems.map((item) => {
            if (item.type === 'dropdown') {
              const isSystemicShifts = item.name === 'Systemic Shifts';
              const isUlearn = item.name === 'Ulearn';
              const isMeetX = item.name === 'MeetX';
              const isOpen = isSystemicShifts ? isSystemicShiftsOpen : (isUlearn ? isUlearnOpen : (isMeetX ? isMeetXOpen : false));
              const setIsOpen = isSystemicShifts ? setIsSystemicShiftsOpen : (isUlearn ? setIsUlearnOpen : (isMeetX ? setIsMeetXOpen : () => {}));
              const dropdownRef = isSystemicShifts ? systemicShiftsDropdownRef : (isUlearn ? ulearnDropdownRef : (isMeetX ? meetXDropdownRef : null));
              const isInSection = isSystemicShifts ? isInSystemicShifts : (isUlearn ? isInUlearn : (isMeetX ? isInMeetX : false));
              
              return (
                <div 
                  key={item.name}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-center h-full px-3 lg:px-4
                      text-center text-sm font-semibold transition-all duration-200 ease-in-out
                      relative group whitespace-nowrap
                      ${isInSection ? 'text-white' : 'text-cyan-200 hover:text-white'}
                    `}
                  >
                    {item.name}
                    <FaChevronDown className="ml-1 text-xs" />
                    <span
                      className={`
                        absolute bottom-0 left-0 w-full h-1 bg-cyan-300 rounded-t-full
                        transition-all duration-300 ease-out transform
                        ${isInSection ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                      `}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {item.subItems?.map((subItem) => {
                        const isActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={`
                              block px-4 py-2 text-sm transition-colors
                              ${isActive
                                ? 'bg-teal-50 text-teal-700 font-semibold'
                                : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                              }
                            `}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular link items
            const isActive = pathname === item.href || 
              (item.href === '/#home' && pathname === '/') ||
              (item.href.startsWith('/#') && pathname === '/');
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

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu Flyout */}
      <div 
        className={`
          md:hidden fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95 z-[100]
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-6 pt-20 overflow-y-auto">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-5 right-5 text-white text-3xl p-2"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
          
          {navItems.map((item) => {
            if (item.type === 'dropdown') {
              const isSystemicShifts = item.name === 'Systemic Shifts';
              const isUlearn = item.name === 'Ulearn';
              const isMeetX = item.name === 'MeetX';
              const isOpen = isSystemicShifts ? isSystemicShiftsOpen : (isUlearn ? isUlearnOpen : (isMeetX ? isMeetXOpen : false));
              const setIsOpen = isSystemicShifts ? setIsSystemicShiftsOpen : (isUlearn ? setIsUlearnOpen : (isMeetX ? setIsMeetXOpen : () => {}));
              
              return (
                <div key={item.name} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-cyan-200 hover:text-white text-2xl font-semibold flex items-center gap-2"
                  >
                    {item.name}
                    <FaChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-3 mt-2">
                      {item.subItems?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={handleLinkClick}
                          className="text-cyan-300 hover:text-white text-xl font-medium pl-4"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className="text-cyan-200 hover:text-white text-2xl font-semibold"
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
