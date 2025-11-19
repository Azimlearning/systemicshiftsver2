// src/app/meetx/page.js

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function MeetXPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow relative z-10 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">MeetX</h1>
          <p className="text-xl text-gray-600">Coming Soon</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

