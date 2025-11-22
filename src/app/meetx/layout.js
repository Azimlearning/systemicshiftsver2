// src/app/meetx/layout.js

import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * MeetX Layout
 * 
 * Simplified layout for the single-page MeetX section.
 */
export default function MeetXLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow relative z-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

