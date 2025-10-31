// src/app/submit-story/page.js
'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SubmitStories from '../../components/SubmitStories';

export default function SubmitStoryPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* We use the main header so users can navigate back */}
      <Header /> 
      <main className="flex-grow pt-10 md:pt-16">
        <SubmitStories />
      </main>
      <Footer />
    </div>
  );
}