// src/app/page.js
/**
 * Landing Page - Upstream Buzz
 * 
 * This is the main landing page that users see when they first visit the site.
 * It displays the Upstream Buzz section (HeroSection component) along with
 * new sections: Website Capabilities, Rotating Banner, and Jukris Lens.
 * 
 * All Systemic Shifts content (Upstream Target, Key Shifts, etc.) has been
 * moved to the /systemic-shifts routes with their own layout and navigation.
 */

'use client';

import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import LoadingAnimation from '../components/LoadingAnimation';
import WebsiteCapabilities from '../components/WebsiteCapabilities';
import RotatingBanner from '../components/RotatingBanner';
import JukrisLens from '../components/JukrisLens';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <LoadingAnimation />
      <Header />
      <main className="flex-grow relative z-10">
        {/* Landing Page: Upstream Buzz */}
        <section id="home">
          <HeroSection />
        </section>
        
        {/* Rotating Banner Section (Hero Banner) */}
        <RotatingBanner />
        
        {/* Website Capabilities Section */}
        <WebsiteCapabilities />
        
        {/* Jukris Lens Section */}
        <JukrisLens />
      </main>
      <Footer />
    </div>
  );
}
