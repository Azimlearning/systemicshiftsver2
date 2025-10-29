// src/components/UpstreamTarget.js
import Image from 'next/image'; // For optimized image handling in Next.js

export default function UpstreamTarget() {
  const upstreamEntities = [
    {
      title: 'PCSB',
      description: 'Focus on High Value, High Upside assets in Malaysia',
      color: 'bg-indigo-600', // Example color
    },
    {
      title: 'PCIV',
      description: 'Grow International value via disciplined portfolio high-grading',
      color: 'bg-purple-600', // Example color
    },
    {
      title: 'PCCSV',
      description: 'Value driven through diversified CCS portfolio in Malaysia and International',
      color: 'bg-pink-600', // Example color
    },
    {
      title: 'Vestigo',
      description: 'Value-grow marginal assets in Malaysia and International',
      color: 'bg-red-600', // Example color
    },
    {
      title: 'Satellite Model',
      description: 'Partnership to unlock opportunities',
      color: 'bg-orange-600', // Example color
    },
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Upstream Target Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
          Upstream <span className="font-light">Target</span>
        </h2>

        {/* Increase NPV by 30% Diagram */}
        <div className="flex justify-center mb-16">
          {/* We assume you've placed 'npv-diagram.png' in your 'public' folder */}
          {/* For a real project, you'd export this section as an optimized image */}
          <Image
            src="/npv-diagram.png" // Path to your extracted image
            alt="Increase NPV by 30% Diagram"
            width={1000} // Adjust based on your image's intrinsic width
            height={700} // Adjust based on your image's intrinsic height
            className="max-w-full h-auto"
          />
        </div>

        {/* Upstream Entities Look & Feel */}
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8">
          Upstream Entities Look & Feel by 2035
        </h3>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {upstreamEntities.map((entity) => (
            <div
              key={entity.title}
              className={`flex-1 min-w-[180px] max-w-[220px] p-4 text-center text-white rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${entity.color}`}
            >
              <h4 className="font-bold text-xl mb-2">{entity.title}</h4>
              <p className="text-sm">{entity.description}</p>
            </div>
          ))}
        </div>

        {/* Upstream has set a clear end state heading */}
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8">
          Upstream has set a clear end state <br /> to be achieved by 2035
        </h3>

        {/* Desired Upstream Value Trajectory Chart */}
        <div className="flex justify-center mb-8">
          {/* We assume you've placed 'value-trajectory-chart.png' in your 'public' folder */}
          {/* For a real project, you'd export this section as an optimized image */}
          <Image
            src="/value-trajectory-chart.png" // Path to your extracted image
            alt="Desired Upstream Value Trajectory Chart"
            width={1000} // Adjust based on your image's intrinsic width
            height={700} // Adjust based on your image's intrinsic height
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
