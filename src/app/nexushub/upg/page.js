// src/app/nexushub/upg/page.js

// Reusable WIP component
const WorkInProgress = () => (
  <div className="bg-white p-12 rounded-lg shadow-lg text-center">
    <h3 className="text-3xl font-bold text-gray-800 mb-4">Work in Progress</h3>
    <p className="text-gray-600">This section is currently under development.</p>
  </div>
);

export default function UPGPage() {
  return <WorkInProgress />;
}
