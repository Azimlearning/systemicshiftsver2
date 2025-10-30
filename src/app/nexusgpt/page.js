// src/app/nexusgpt/page.js
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatInterface from '../../components/ChatInterface';
import StaticFAQ from '../../components/StaticFAQ';

export default function NexusGPTPage() {
  // --- IMPORTANT: Get your deployed function URL ---
  const chatFunctionUrl = process.env.NEXT_PUBLIC_CHAT_FUNCTION_URL || "https://askchatbot-el2jwxb5bq-uc.a.run.app"; // Use environment variable or paste directly

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* --- Main Chat Area (Gemini-style) --- */}
        <div className="lg:col-span-2 h-[80vh] flex flex-col justify-between">
          {/* This is a spacer to push the chat to the middle */}
          <div className="flex-grow"></div>
          
          <div className="w-full max-w-3xl mx-auto">
             <h1 className="text-5xl font-bold text-white text-center mb-4">Hello, Fakhrul</h1>
             <p className="text-xl text-gray-300 text-center mb-8">How can NexusGPT help you today?</p>
             <ChatInterface chatFunctionUrl={chatFunctionUrl} />
          </div>
          
           {/* This is another spacer */}
          <div className="flex-grow"></div>
        </div>

        {/* --- Sidebar for Static FAQ --- */}
        <div className="lg:col-span-1 lg:pt-20"> {/* Added padding-top to align */}
           <StaticFAQ />
        </div>

      </main>
      <Footer />
    </div>
  );
}
// Remember to replace YOUR_ASKCHATBOT_FUNCTION_URL_HERE
