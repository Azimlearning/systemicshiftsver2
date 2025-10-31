// src/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        
        {/* Column 1: PETRONAS Info */}
        <div>
          <h4 className="font-bold text-white mb-3 text-base">PETRONAS</h4>
          <p>&copy; {currentYear} Petroliam Nasional Berhad (PETRONAS)</p>
          <p>All rights reserved.</p>
          <div className="mt-2 space-x-3">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>

        {/* Column 2: Site Links */}
        <div>
          <h4 className="font-bold text-white mb-3 text-base">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link href="/#home" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/nexushub" className="hover:text-white transition-colors">NexusHub</Link></li>
            <li><Link href="/nexusgpt" className="hover:text-white transition-colors">NexusGPT</Link></li>
            <li><Link href="/submit-story" className="hover:text-white transition-colors">Submit Story</Link></li>
          </ul>
        </div>

        {/* Column 3: Portfolio/Creator Info */}
        <div>
           <h4 className="font-bold text-white mb-3 text-base">Site Information</h4>
           <p>Developed by: Fakhrul Azim</p>
           <p><Link href="https://your-portfolio-url.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">Developer Portfolio</Link></p>
           <p className="mt-2 text-xs italic">This site is a conceptual project.</p>
        </div>
      </div>
    </footer>
  );
}
// Remember to replace your-portfolio-url.com!