// src/app/layout.js
'use client'; // <-- Must be a client component
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import MiniChatWidget from '../components/MiniChatWidget';
import { usePathname } from 'next/navigation'; // <-- Must import this

// Metadata has been removed as this is now a Client Component.
// For SEO, it should be handled in a parent server component layout.

export default function RootLayout({ children }) {
  const pathname = usePathname();
  // Don't show the mini chat widget if we're on the main NexusGPT page
  const showMiniChat = !pathname.startsWith('/nexusgpt');

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        {/* This logic hides the widget on the main chat page */}
        {showMiniChat && <MiniChatWidget />}
      </body>
    </html>
  );
}
