// components/Hero.js
export default function Hero() {
  return (
    <section 
      id="upstream-target" // <-- ID for nav link
      className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white py-16 md:py-24 lg:py-32 shadow-inner scroll-mt-20"
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 uppercase">
          PETRONAS 2.0
        </h1>
        <p className="text-xl md:text-3xl font-light mb-8 max-w-4xl mx-auto border-t-2 border-b-2 border-white py-4">
          <span className="block mb-2 md:inline-block md:mr-4">By <span className="font-bold">2035</span></span>
          <span className="block md:inline-block">An <span className="font-semibold">Integrated energy company</span> serving the world&apos;s energy and solutions needs safely, reliably and sustainably.</span>
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-6 mt-12">
          <div className="bg-teal-600 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer min-w-[200px] flex items-center justify-center">
            <p className="text-lg md:text-xl font-semibold">Competitive Upstream</p>
          </div>
          <div className="bg-teal-600 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer min-w-[200px] flex items-center justify-center">
            <p className="text-lg md:text-xl font-semibold">Reliable Global LNG Supplier</p>
          </div>
          <div className="bg-teal-600 bg-opacity-70 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer min-w-[200px] flex items-center justify-center">
            <p className="text-lg md:text-xl font-semibold">Energy Superstore</p>
          </div>
        </div>
      </div>
    </section>
  );
}
