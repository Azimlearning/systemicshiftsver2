// src/app/petronas-2.0/page.js

import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Footer from '../../components/Footer';

export default function Petronas20Page() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10">
        <section id="petronas-2.0">
          <Hero />
        </section>
      </main>
      <Footer />
    </div>
  );
}

