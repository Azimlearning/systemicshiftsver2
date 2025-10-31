// src/app/page.js

import Header from '../components/Header';
import Hero from '../components/Hero';
import HeroSection from '../components/HeroSection'; // Corrected import
import UpstreamTarget from '../components/UpstreamTarget';
import KeyShifts from '../components/KeyShifts';
import MindsetBehaviour from '../components/MindsetBehaviour';
import OurProgress from '../components/OurProgress';
// REMOVED Faq and SubmitStories imports
import Footer from '../components/Footer'; // <-- NEW

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
       {/* --- ADDED relative z-10 HERE --- */}
      <main className="flex-grow relative z-10">
        <section id="home">
          <Hero />
        </section>
        <section id="upstream-target"> {/* Changed this ID to match the link */}
           <HeroSection />
        </section>
        {/* We keep this section wrapper in case UpstreamTarget needs it */}
        <section> 
          <UpstreamTarget />
        </section>
        <section id="key-shifts">
          <KeyShifts />
        </section>
        <section id="mindset-behaviour">
          <MindsetBehaviour />
        </section>
        <section id="our-progress">
          <OurProgress />
        </section>

        {/* --- REMOVED FAQ and SubmitStories SECTIONS --- */}

      </main>
      <Footer /> {/* <-- NEW */}
    </div>
  );
}