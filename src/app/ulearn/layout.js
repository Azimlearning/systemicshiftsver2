// src/app/ulearn/layout.js
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * Ulearn Layout with Second-Level Navigation
 * 
 * This layout provides a second-level navigation bar that appears when
 * users are within the Ulearn section, matching the Systemic Shifts structure.
 */
export default function UlearnLayout({ children }) {
  const pathname = usePathname();

  const ulearnNavItems = [
    { name: 'Overview', href: '/ulearn' },
    { name: 'Quizzes', href: '/ulearn/quizzes' },
    { name: 'AI Podcast Generator', href: '/ulearn/podcast' },
    { name: 'My Podcasts', href: '/ulearn/podcast/my-podcasts' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      
      {/* Second-Level Navigation Bar - Only visible in Ulearn section */}
      <div className="sticky top-16 md:top-20 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto py-3">
            {ulearnNavItems.map((item) => {
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
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
