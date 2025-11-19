// src/app/page.js
/**
 * Landing Page - Upstream Buzz
 * 
 * This is the main landing page that users see when they first visit the site.
 * It displays the Upstream Buzz section (HeroSection component).
 * 
 * All Systemic Shifts content (Upstream Target, Key Shifts, etc.) has been
 * moved to the /systemic-shifts routes with their own layout and navigation.
 */

import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        {/* Landing Page: Upstream Buzz */}
        <section id="home">
          <HeroSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
