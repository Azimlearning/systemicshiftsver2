'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- Import Link
import { db } from '../../lib/firebase'; // Adjust path if needed
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function DocumentsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // --- Authentication Check ---
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
      router.push('/login'); // Redirect if not logged in
    } else {
      setIsLoggedIn(true);

      // --- Fetch Submissions ---
      const fetchSubmissions = async () => {
        setLoading(true);
        setError('');
        try {
          const storiesRef = collection(db, 'stories');
          // Order by submission time, newest first
          const q = query(storiesRef, orderBy('submittedAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const fetchedSubmissions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSubmissions(fetchedSubmissions);
        } catch (err) {
          console.error("Error fetching submissions:", err);
          setError('Failed to load submissions.');
        } finally {
          setLoading(false);
        }
      };

      fetchSubmissions();
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  // Render loading state or if not logged in (avoids flash of content)
  if (!isLoggedIn || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-teal-700">Documents Hub</h1>
        {/* --- Action Buttons Container --- */}
        <div className="flex items-center gap-4">
          {/* --- NEW Back to Home Button --- */}
          <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Back to Home
          </Link>
          {/* --- END NEW Button --- */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
        {/* --- END Action Buttons Container --- */}
      </header>

      {/* Section 1: Submissions */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">Story Submissions</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {submissions.length === 0 ? (
          <p className="text-gray-600">No submissions found.</p>
        ) : (
          <div className="space-y-8"> {/* Increased spacing */}
            {submissions.map((sub) => (
              <div key={sub.id} className="border border-gray-300 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"> {/* Added bg-white and more padding */}

                {/* --- START: Full Submission Details --- */}
                <h3 className="text-2xl font-bold text-teal-700 mb-3 border-b pb-2">
                  {sub.storyTitle || sub.nonShiftTitle || 'Untitled Story'}
                </h3>

                 {/* --- UPDATED Metadata Colors --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4 text-gray-700"> {/* Changed overall text color */}
                  <div><strong>Submitter:</strong> {sub.fullName || 'N/A'}</div>
                  <div><strong>Division:</strong> {sub.division || 'N/A'}</div>
                  <div><strong>Department:</strong> {sub.department || 'N/A'}</div>
                  <div><strong>Submitted At:</strong> {sub.submittedAt?.toDate().toLocaleString() || 'N/A'}</div>
                  <div><strong>Aligns w/ Shifts?:</strong> {sub.alignsWithShifts ? sub.alignsWithShifts.toUpperCase() : 'N/A'}</div>
                </div>
                {/* --- END UPDATE --- */}

                {/* --- Conditional Fields Display --- */}
                {sub.alignsWithShifts === 'yes' && (
                  <div className="mb-4 space-y-2 text-sm bg-teal-50 p-4 rounded border border-teal-200">
                    <h4 className="font-semibold text-teal-800 text-base mb-1">Systemic Shift Details:</h4>
                    <p><strong>Key Shifts:</strong> {sub.keyShifts?.join(', ') || 'None selected'}</p>
                    {sub.focusAreas?.length > 0 && <p><strong>Focus Areas (Advantaged Barrels):</strong> {sub.focusAreas.join(', ')}</p>}
                    <p><strong>Case for Change:</strong> {sub.caseForChange || 'N/A'}</p>
                    <p><strong>Desired End State:</strong> {sub.desiredEndState || 'N/A'}</p>
                    <p><strong>Mindsets Cultivated:</strong> {sub.desiredMindset?.join(', ') || 'None selected'}</p>
                    <p><strong>Mindset Explanation:</strong> {sub.mindsetExplanation || 'N/A'}</p>
                  </div>
                )}
                {sub.alignsWithShifts === 'no' && (
                   <div className="mb-4 space-y-2 text-sm bg-gray-50 p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 text-base mb-1">Non-Shift Story Details:</h4>
                    <p><strong>Description:</strong> {sub.nonShiftDescription || 'N/A'}</p>
                  </div>
                )}

                 {/* --- Files Section --- */}
                 <div className="mb-4 text-sm">
                    <h4 className="font-semibold text-gray-700 text-base mb-2">Attached Files:</h4>
                    {sub.writeUpURL ? (
                         <p><a href={sub.writeUpURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Detailed Write-up</a></p>
                    ) : <p className="text-gray-500 italic">No detailed write-up uploaded.</p>}
                     {sub.visualURLs && sub.visualURLs.length > 0 ? (
                        <div className="mt-2">
                            <p><strong>Visuals ({sub.visualURLs.length}):</strong></p>
                            <ul className="list-disc list-inside ml-4">
                                {sub.visualURLs.map((url, index) => (
                                    <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visual File {index + 1}</a></li>
                                ))}
                            </ul>
                        </div>
                    ) : <p className="text-gray-500 italic mt-1">No visuals uploaded.</p>}
                 </div>

                 {/* --- Consent --- */}
                 <div className="text-xs text-gray-500 border-t pt-2 mt-4">
                    <p><strong>Acknowledgement & Consent Given:</strong> {sub.acknowledgement ? 'Yes' : 'No'}</p>
                 </div>

                {/* --- END: Full Submission Details --- */}


                {/* Display AI Sections (Layout adjusted) */}
                <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Generated Write-up:</h4>
                       <p className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 whitespace-pre-wrap h-60 overflow-y-auto"> {/* Added fixed height and scroll */}
                           {sub.aiGeneratedWriteup || <span className="text-gray-500 italic">Not generated yet.</span>}
                       </p>
                   </div>
                   <div>
                       <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Infographic Concept:</h4>
                       <p className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 whitespace-pre-wrap h-60 overflow-y-auto"> {/* Added fixed height and scroll */}
                           {sub.aiInfographicConcept || <span className="text-gray-500 italic">Not generated yet.</span>}
                       </p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Collaterals WIP */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 border-b pb-2">Collaterals</h2>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
          <p className="font-bold">Work in Progress</p>
          <p>This section is currently under development.</p>
        </div>
      </section>
    </div>
  );
}
