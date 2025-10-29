// src/components/Collaterals.js
import Image from 'next/image';
import Link from 'next/link'; // For clickable elements

export default function Collaterals() {
  // Placeholder links for now, you will provide these later
  const downloadLinks = {
    ai: '#', // Placeholder link for AI download
    png: '#', // Placeholder link for PNG download
    pdf: '#', // Placeholder link for PDF download
    micrositeLaptop: '#', // Placeholder link for laptop preview
    micrositeTablet: '#', // Placeholder link for tablet preview
  };

  return (
    <section id="collaterals" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Top Banner: STRICTLY FOR INTERNAL USE ONLY */}
        <div className="bg-red-800 text-white text-center py-3 mb-12 rounded-lg shadow-md">
          <p className="text-xl font-bold uppercase tracking-wider">Strictly for internal use only</p>
        </div>

        {/* Top Row: Logo Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

          {/* Column 1: Logo White Background */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-gray-700 font-semibold mb-4">Application on solid white backgrounds</h3>
            <Link href={downloadLinks.ai} passHref>
              <Image
                src="/collaterals-logo-white-bg.png" // Crop this image
                alt="Upstream Systemic Shifts Logo on White Background"
                width={300}
                height={150}
                className="w-full h-auto max-w-[300px] mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-gray-600 text-sm">To download the logo, click on the preferred format.</p>
            <p className="text-gray-600 text-sm font-semibold">Formats:
              <Link href={downloadLinks.ai} className="text-teal-600 hover:underline ml-1">Ai</Link>,
              <Link href={downloadLinks.png} className="text-teal-600 hover:underline ml-1">Png</Link>,
              <Link href={downloadLinks.pdf} className="text-teal-600 hover:underline ml-1">Pdf</Link>
            </p>
          </div>

          {/* Column 2: Logo Green Background */}
          <div className="bg-teal-700 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-white font-semibold mb-4">Application on PETRONAS Emerald Green/dark/black backgrounds</h3>
            <Link href={downloadLinks.ai} passHref>
              <Image
                src="/collaterals-logo-green-bg.png" // Crop this image
                alt="Upstream Systemic Shifts Logo on Green Background"
                width={300}
                height={150}
                className="w-full h-auto max-w-[300px] mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-gray-200 text-sm">To download the logo, click on the preferred format.</p>
            <p className="text-gray-200 text-sm font-semibold">Formats:
              <Link href={downloadLinks.ai} className="text-teal-300 hover:underline ml-1">Ai</Link>,
              <Link href={downloadLinks.png} className="text-teal-300 hover:underline ml-1">Png</Link>,
              <Link href={downloadLinks.pdf} className="text-teal-300 hover:underline ml-1">Pdf</Link>
            </p>
          </div>

          {/* Column 3: Logo Usage Examples */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-gray-700 font-semibold mb-4">Shown above are examples of how our logo should appear in various situations and scenarios.</h3>
            <Image
              src="/collaterals-logo-usage.png" // Crop this image
              alt="Logo Usage Examples"
              width={300}
              height={300}
              className="w-full h-auto max-w-[300px]"
            />
          </div>

        </div>

        {/* Bottom Row: Microsite Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Microsite Preview 1 (Laptop) */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Link href={downloadLinks.micrositeLaptop} passHref>
              <Image
                src="/collaterals-microsite-laptop.png" // Crop this image
                alt="Microsite Preview on Laptop"
                width={500}
                height={350}
                className="w-full h-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            {/* You can add text here if needed, like "Download Microsite Presentation" */}
          </div>

          {/* Microsite Preview 2 (Tablet) */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Link href={downloadLinks.micrositeTablet} passHref>
              <Image
                src="/collaterals-microsite-tablet.png" // Crop this image
                alt="Microsite Preview on Tablet"
                width={500}
                height={350}
                className="w-full h-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            {/* You can add text here if needed, like "View Tablet Version" */}
          </div>

        </div>

      </div>
    </section>
  );
}