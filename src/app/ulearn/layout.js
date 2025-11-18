// src/app/ulearn/layout.js
'use client'; // This layout uses hooks (usePathname)

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaVideo, FaQuestionCircle, FaPodcast, FaGraduationCap } from 'react-icons/fa'; // Icons
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Helper component for the nav links
const SideNavLink = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 text-sm font-medium
        rounded-md transition-colors
        ${isActive
          ? 'bg-teal-600 text-white' // Active style
          : 'text-gray-700 hover:bg-gray-100' // Inactive style
        }
      `}
    >
      {children}
    </Link>
  );
};

export default function UlearnLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header /> {/* Main site header */}

      <div className="flex-grow">
        {/* Main content area with side nav */}
        <div className="container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Side Navbar */}
          <aside className="w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-lg shadow-lg mb-6 lg:mb-0">
            <nav className="flex flex-col gap-2">
              <SideNavLink href="/ulearn">
                <FaGraduationCap />
                Overview
              </SideNavLink>
              <SideNavLink href="/ulearn/uflix">
                <FaVideo />
                Uflix
              </SideNavLink>
              <SideNavLink href="/ulearn/quizzes">
                <FaQuestionCircle />
                Quizzes
              </SideNavLink>
              <SideNavLink href="/ulearn/podcast">
                <FaPodcast />
                AI Podcast Generator
              </SideNavLink>
            </nav>
          </aside>
          {/* END SIDE NAVBAR */}

          {/* Content Area */}
          <main className="flex-1">
            {children} {/* This is where your pages will render */}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

