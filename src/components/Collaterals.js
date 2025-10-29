// src/components/Collaterals.js
import Image from 'next/image';
import Link from 'next/link'; // For clickable elements

export default function Collaterals() {
  const downloadLinks = {
    ai: '#',
    png: '#',
    pdf: '#',
    micrositeLaptop: '#',
    micrositeTablet: '#',
  };

  // Helper function for placeholder area styling
  const PlaceholderBox = ({ children, width, height }) => (
    <div
      className="w-full bg-gray-200 border border-gray-300 rounded-md flex items-center justify-center text-center p-4 text-gray-500 italic"
      style={{
        maxWidth: `${width}px`,
        aspectRatio: `${width} / ${height}` // Maintain aspect ratio
      }}
    >
      {children}
    </div>
  );

  return (
    <section id="collaterals" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-red-800 text-white text-center py-3 mb-12 rounded-lg shadow-md">
          <p className="text-xl font-bold uppercase tracking-wider">Strictly for internal use only</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Column 1 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-gray-700 font-semibold mb-4">Application on solid white backgrounds</h3>
            <Link href={downloadLinks.ai} passHref>
              <PlaceholderBox width={300} height={150}>
                Upstream Systemic Shifts Logo on White Background
              </PlaceholderBox>
            </Link>
            <p className="text-gray-600 text-sm mt-4">To download the logo, click on the preferred format.</p>
            <p className="text-gray-600 text-sm font-semibold">Formats:
              <Link href={downloadLinks.ai} className="text-teal-600 hover:underline ml-1">Ai</Link>,
              <Link href={downloadLinks.png} className="text-teal-600 hover:underline ml-1">Png</Link>,
              <Link href={downloadLinks.pdf} className="text-teal-600 hover:underline ml-1">Pdf</Link>
            </p>
          </div>

          {/* Column 2 */}
          <div className="bg-teal-700 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-white font-semibold mb-4">Application on PETRONAS Emerald Green/dark/black backgrounds</h3>
            <Link href={downloadLinks.ai} passHref>
              <PlaceholderBox width={300} height={150}>
                 Upstream Systemic Shifts Logo on Green Background
              </PlaceholderBox>
            </Link>
            <p className="text-gray-200 text-sm mt-4">To download the logo, click on the preferred format.</p>
            <p className="text-gray-200 text-sm font-semibold">Formats:
              <Link href={downloadLinks.ai} className="text-teal-300 hover:underline ml-1">Ai</Link>,
              <Link href={downloadLinks.png} className="text-teal-300 hover:underline ml-1">Png</Link>,
              <Link href={downloadLinks.pdf} className="text-teal-300 hover:underline ml-1">Pdf</Link>
            </p>
          </div>

          {/* Column 3 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-gray-700 font-semibold mb-4">Shown above are examples of how our logo should appear in various situations and scenarios.</h3>
            <PlaceholderBox width={300} height={300}>
              Logo Usage Examples
            </PlaceholderBox>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bottom Row 1 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Link href={downloadLinks.micrositeLaptop} passHref>
              <PlaceholderBox width={500} height={350}>
                Microsite Preview on Laptop
              </PlaceholderBox>
            </Link>
          </div>

          {/* Bottom Row 2 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Link href={downloadLinks.micrositeTablet} passHref>
              <PlaceholderBox width={500} height={350}>
                 Microsite Preview on Tablet
              </PlaceholderBox>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
