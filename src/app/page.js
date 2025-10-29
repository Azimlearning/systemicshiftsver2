// src/app/page.js

import Header from '../components/Header';
import Hero from '../components/Hero';
import UpstreamTarget from '../components/UpstreamTarget';
import KeyShifts from '../components/KeyShifts';
import MindsetBehaviour from '../components/MindsetBehaviour';
import OurProgress from '../components/OurProgress';
import Collaterals from '../components/Collaterals';
import Faq from '../components/Faq';
import SubmitStories from '../components/SubmitStories'; // Import the final component

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />

      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="upstream-target">
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

        <section id="collaterals">
          <Collaterals />
        </section>

        <section id="faq">
          <Faq />
        </section>

        {/* Section 8: SUBMIT STORIES */}
        <section id="submit-stories">
          <SubmitStories /> {/* Add the SubmitStories component here */}
        </section>
      </main>
    </div>
  );
}