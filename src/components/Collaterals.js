import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */
export default function Collaterals() {
  // Download links pointing to actual image files
  const downloadLinks = {
    logoWhite: '/OurCollaterals/Systemic-Shifts-Logo-On-White-Background.png',
    logoGreen: '/OurCollaterals/Systemic-Shifts-Logo-On-Green-Background.png',
    logoUsage: '/OurCollaterals/Logo-Usage-Examples.png',
    micrositeLaptop: '/OurCollaterals/Microsite-Preview-on-Laptop.png',
    micrositeTablet: '/OurCollaterals/Microsite-Preview-on-Tablet.png',
    // Format download links (you can add actual AI/PDF files later if needed)
    ai: '/OurCollaterals/Systemic-Shifts-Logo-On-White-Background.png', // Placeholder - replace with actual AI file
    png: '/OurCollaterals/Systemic-Shifts-Logo-On-White-Background.png',
    pdf: '/OurCollaterals/Systemic-Shifts-Logo-On-White-Background.png', // Placeholder - replace with actual PDF file
  };

  return (
    <section id="collaterals" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-red-800 text-white text-center py-3 mb-12 rounded-lg shadow-md">
          <p className="text-xl font-bold uppercase tracking-wider">Strictly for internal use only</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Column 1 - Logo on White Background */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-gray-700 font-semibold mb-4">Application on solid white backgrounds</h3>
            <Link href={downloadLinks.logoWhite} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-full max-w-[300px] mb-2">
                <img
                  src={downloadLinks.logoWhite}
                  alt="Upstream Systemic Shifts Logo on White Background"
                  className="w-full h-auto object-contain rounded-md"
                />
              </div>
            </Link>
            <p className="text-gray-600 text-sm mt-4">To download the logo, click on the preferred format.</p>
            <p className="text-gray-600 text-sm font-semibold">Formats:
              <Link href={downloadLinks.ai} download className="text-teal-600 hover:underline ml-1">Ai</Link>,
              <Link href={downloadLinks.png} download className="text-teal-600 hover:underline ml-1">Png</Link>,
              <Link href={downloadLinks.pdf} download className="text-teal-600 hover:underline ml-1">Pdf</Link>
            </p>
          </div>

          {/* Column 2 - Logo on Green Background */}
          <div className="bg-teal-700 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-white font-semibold mb-4">Application on PETRONAS Emerald Green/dark/black backgrounds</h3>
            <Link href={downloadLinks.logoGreen} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-full max-w-[300px] mb-2">
                <img
                  src={downloadLinks.logoGreen}
                  alt="Upstream Systemic Shifts Logo on Green Background"
                  className="w-full h-auto object-contain rounded-md"
                />
              </div>
            </Link>
            <p className="text-gray-200 text-sm mt-4">To download the logo, click on the preferred format.</p>
            <p className="text-gray-200 text-sm font-semibold">Formats:
              <Link href={downloadLinks.ai} download className="text-teal-300 hover:underline ml-1">Ai</Link>,
              <Link href={downloadLinks.png} download className="text-teal-300 hover:underline ml-1">Png</Link>,
              <Link href={downloadLinks.pdf} download className="text-teal-300 hover:underline ml-1">Pdf</Link>
            </p>
          </div>

          {/* Column 3 - Logo Usage Examples */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-gray-700 font-semibold mb-4">Shown above are examples of how our logo should appear in various situations and scenarios.</h3>
            <Link href={downloadLinks.logoUsage} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-full max-w-[300px]">
                <img
                  src={downloadLinks.logoUsage}
                  alt="Logo Usage Examples"
                  className="w-full h-auto object-contain rounded-md"
                />
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bottom Row 1 - Microsite Preview on Laptop */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Link href={downloadLinks.micrositeLaptop} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-90 transition-opacity w-full">
              <div className="w-full max-w-[500px] mx-auto">
                <img
                  src={downloadLinks.micrositeLaptop}
                  alt="Microsite Preview on Laptop"
                  className="w-full h-auto object-contain rounded-md"
                />
              </div>
            </Link>
            <p className="text-gray-600 text-sm mt-4">Click image to view full size</p>
          </div>

          {/* Bottom Row 2 - Microsite Preview on Tablet */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Link href={downloadLinks.micrositeTablet} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-90 transition-opacity w-full">
              <div className="w-full max-w-[500px] mx-auto">
                <img
                  src={downloadLinks.micrositeTablet}
                  alt="Microsite Preview on Tablet"
                  className="w-full h-auto object-contain rounded-md"
                />
              </div>
            </Link>
            <p className="text-gray-600 text-sm mt-4">Click image to view full size</p>
          </div>
        </div>
      </div>
    </section>
  );
}
