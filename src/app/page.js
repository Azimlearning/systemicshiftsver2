// src/app/page.js
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Hero from '@/components/Hero';
import UpstreamTarget from '@/components/UpstreamTarget';
import KeyShifts from '@/components/KeyShifts';
import MindsetBehaviour from '@/components/MindsetBehaviour';
import OurProgress from '@/components/OurProgress';
import Faq from '@/components/Faq';
import SubmitStories from '@/components/SubmitStories';

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <Hero />
        <UpstreamTarget />
        <KeyShifts />
        <MindsetBehaviour />
        <OurProgress />
        <Faq />
        <SubmitStories />
      </main>
      {/* Footer component removed as it does not exist */}
    </div>
  );
}
