// src/app/page.js

import Header from '../components/Header';
import Hero from '../components/Hero';
import HeroSection from '../components/HeroSection';
import UpstreamTarget from '../components/UpstreamTarget';
import KeyShifts from '../components/KeyShifts';
import MindsetBehaviour from '../components/MindsetBehaviour';
import OurProgress from '../components/OurProgress';
import Footer from '../components/Footer';
import FadeInWhenVisible from '../components/animations/FadeInWhenVisible';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        <section id="home">
          <Hero />
        </section>

        <FadeInWhenVisible key="upstream-target">
          <section id="upstream-target">
             <HeroSection />
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible key="upstream-target-details">
          <section id="upstream-target-details">
            <UpstreamTarget />
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible key="key-shifts">
          <section id="key-shifts">
            <KeyShifts />
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible key="mindset-behaviour">
          <section id="mindset-behaviour">
            <MindsetBehaviour />
          </section>
        </FadeInWhenVisible>

        <FadeInWhenVisible key="our-progress">
          <section id="our-progress">
            <OurProgress />
          </section>
        </FadeInWhenVisible>

      </main>
      <Footer />
    </div>
  );
}
