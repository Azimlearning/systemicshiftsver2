// src/app/systemic-shifts/layout.js
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * Systemic Shifts Layout with Second-Level Navigation
 * 
 * This layout provides a second-level navigation bar that appears when
 * users are within the Systemic Shifts section, similar to Microsoft/Apple
 * website navigation patterns.
 */
export default function SystemicShiftsLayout({ children }) {
  const pathname = usePathname();

  const systemicShiftsNavItems = [
    { name: 'Upstream Target', href: '/systemic-shifts/upstream-target' },
    { name: 'Key Shifts', href: '/systemic-shifts/key-shifts' },
    { name: 'Mindset & Behaviour', href: '/systemic-shifts/mindset-behaviour' },
    { name: 'Our Progress', href: '/systemic-shifts/our-progress' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      
      {/* Second-Level Navigation Bar - Only visible in Systemic Shifts section */}
      <div className="sticky top-16 md:top-20 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto py-3">
            {systemicShiftsNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    px-4 py-2 text-sm font-medium whitespace-nowrap
                    transition-colors duration-200 rounded-md
                    ${isActive
                      ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                      : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="flex-grow relative z-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

