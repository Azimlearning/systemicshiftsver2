// src/components/Header.js
'use client'; // This component will need to be a client component

import Link from 'next/link';
import Image from 'next/image';
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

  // This is the background image for the buttons
  // You must crop ONE of the blue buttons and save it to /public/nav-button-bg.png
  const navBgImage = '/nav-button-bg.png'; // TODO: Upload this image!

  // This useEffect will listen to the scroll position
  // and update the "glowing" button.
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = 'home';
      // Loop through sections to find which one is in view
      navItems.forEach((item) => {
        const section = document.getElementById(item.href.substring(1));
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = item.name;
          }
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  return (
    <header className="w-full sticky top-0 z-50">
      <nav className="flex justify-center">
        {navItems.map((item) => {
          const isActive = item.name === activeSection;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex-1 max-w-[150px] aspect-[4/3] flex items-center justify-center text-center text-white font-bold text-lg hover:opacity-90 transition-all"
            >
              {/* Background Image */}
              <Image
                src={navBgImage}
                alt=""
                layout="fill"
                objectFit="cover"
                className="z-0"
              />
              {/* Text Content */}
              <span className="relative z-10 p-2 leading-tight">
                {item.name}
              </span>
              {/* "Glow" effect for active item */}
              {isActive && (
                <span
                  className="absolute inset-0 z-20"
                  style={{
                    boxShadow: '0 0 15px 5px rgba(110, 231, 255, 0.7)',
                    backgroundImage:
                      'radial-gradient(circle, rgba(110, 231, 255, 0.3) 10%, transparent 70%)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}