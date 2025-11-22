// src/app/nexushub/page.js

import Link from 'next/link';
import { FaBoxOpen, FaImages, FaThList, FaVideo, FaNetworkWired } from 'react-icons/fa';
import FadeInWhenVisible from '../../components/animations/FadeInWhenVisible';

const NexusHubLanding = () => (
  <div className="bg-white p-12 rounded-lg shadow-lg">
    <div className="text-center mb-8">
      <h2 className="text-4xl font-extrabold text-teal-700 mb-4 flex items-center justify-center gap-3">
        <FaNetworkWired />
        Welcome to NexusHub
      </h2>
      <p className="text-xl text-gray-600">
        Your central hub for digital items, collaterals, and submissions.
      </p>
      <p className="text-gray-600 mt-2">
        Explore collaterals, galleries, dropbox submissions, and video content.
      </p>
    </div>

    {/* Quick Links Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Collaterals Card */}
      <Link href="/nexushub/collaterals" className="group">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FaBoxOpen className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-blue-700">Collaterals</h3>
          </div>
          <p className="text-gray-700">
            Access and manage digital collaterals and resources for your projects.
          </p>
        </div>
      </Link>

      {/* UpstreamGallery Card */}
      <Link href="/nexushub/upg" className="group">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FaImages className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-green-700">UpstreamGallery</h3>
          </div>
          <p className="text-gray-700">
            Browse and explore the upstream gallery of images and visual content.
          </p>
        </div>
      </Link>

      {/* Systemic Shifts Dropbox Card */}
      <Link href="/nexushub/dropbox" className="group">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-teal-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-teal-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FaThList className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-teal-700">Systemic Shifts Dropbox</h3>
          </div>
          <p className="text-gray-700">
            Submit and manage your Systemic Shifts stories and submissions.
          </p>
        </div>
      </Link>

      {/* Uflix Card */}
      <Link href="/nexushub/uflix" className="group">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
              <FaVideo className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">Uflix</h3>
          </div>
          <p className="text-gray-700">
            Watch educational videos and content from Systemic Shifts Unplugged and more.
          </p>
        </div>
      </Link>
    </div>
  </div>
);

export default function NexusHubPage() {
  return (
    <FadeInWhenVisible key="nexushub-overview">
      <section id="nexushub-overview">
        <NexusHubLanding />
      </section>
    </FadeInWhenVisible>
  );
}
