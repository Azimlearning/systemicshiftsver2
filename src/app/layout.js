// src/app/layout.js
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import MiniChatWidget from '../components/MiniChatWidget'; // <-- NEW

export const metadata = {
  title: 'Systemic Shifts',
  description: 'PETRONAS Upstream Microsite',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <MiniChatWidget /> {/* <-- NEW */}
      </body>
    </html>
  );
}
