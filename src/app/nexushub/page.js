// src/app/nexushub/page.js
'use client'; // Keep this if you add hooks, otherwise can be server component

// The landing component, now as the default page
const NexusHubLanding = () => (
  <div className="bg-white p-12 rounded-lg shadow-lg text-center">
    <h3 className="text-4xl font-extrabold text-teal-700 mb-4">Welcome to NexusHub</h3>
    <p className="text-xl text-gray-600">
      Your central hub for digital items, collaterals, and submissions.
    </p>
    <p className="text-gray-600 mt-2">
      Use the side navigation to explore the different sections.
    </p>
  </div>
);

export default function NexusHubPage() {
  // This page now only shows the "Overview" content.
  // The layout.js file handles the side nav.
  return <NexusHubLanding />;
}
