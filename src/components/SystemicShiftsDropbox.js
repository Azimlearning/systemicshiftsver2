'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase'; // Adjusted path for components directory
import { collection, getDocs, query, orderBy, limit, startAfter, endBefore, deleteDoc, doc, getCountFromServer } from 'firebase/firestore';
import Link from 'next/link';

// Helper for displaying AI Infographic Concept
const InfographicConceptDisplay = ({ concept }) => {
    if (!concept) {
        return <span className="text-gray-500 italic">Not generated yet.</span>;
    }
    if (concept.error) {
        return <span className="text-red-500 italic">{concept.error}{concept.rawResponse ? `\n\nRaw Response:\n${concept.rawResponse}` : ''}</span>;
    }
    // It's a valid object, so pretty-print it
    return JSON.stringify(concept, null, 2);
};

export default function SystemicShiftsDropbox() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const docsPerPage = 3;

  const fetchSubmissions = async (pageDirection = 'first') => {
    setLoading(true);
    setError('');
    try {
      const storiesRef = collection(db, 'stories');
      let q;

      if (pageDirection === 'first') {
        const countSnapshot = await getCountFromServer(storiesRef);
        setTotalDocs(countSnapshot.data().count);
        q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
        setCurrentPage(1);
      } else if (pageDirection === 'next' && lastVisible) {
        q = query(storiesRef, orderBy('submittedAt', 'desc'), startAfter(lastVisible), limit(docsPerPage));
        setCurrentPage(prev => prev + 1);
      } else if (pageDirection === 'prev') {
        // Simplified: go back to the first page
        q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
        setCurrentPage(1);
      }

      const querySnapshot = await getDocs(q);
      const fetchedSubmissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(fetchedSubmissions);
      setFirstVisible(querySnapshot.docs[0]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  // Auth check and data fetch
  useEffect(() => {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
      // CORRECTED REDIRECT
      router.push('/login?redirect=/nexushub/dropbox');
    } else {
      setIsLoggedIn(true);
      fetchSubmissions('first');
    }
  }, [router]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'stories', id));
      fetchSubmissions('first'); // Refresh list
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete submission.");
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    // This will be shown briefly before the redirect happens.
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-xl">Redirecting to login...</p>
      </div>
    );
  }

   if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <p className="text-gray-600 text-xl">Loading Submissions...</p>
      </div>
    );
  }
  
  const totalPages = Math.ceil(totalDocs / docsPerPage);

  return (
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">Systemic Shifts Dropbox</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {submissions.length === 0 && !loading ? (
          <p className="text-gray-600">No submissions found.</p>
        ) : (
          <div className="space-y-8">
            {submissions.map((sub) => (
              <div key={sub.id} className="border border-gray-300 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow relative">
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="absolute top-4 right-4 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold py-1 px-3 rounded-full transition-colors"
                  title="Delete this submission"
                >
                  Delete
                </button>
                <h3 className="text-2xl font-bold text-teal-700 mb-3 border-b pb-2">
                  {sub.storyTitle || sub.nonShiftTitle || 'Untitled Story'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4 text-gray-700">
                    {/* Submission details */}
                    <div><strong>Submitter:</strong> {sub.fullName || 'N/A'}</div>
                    <div><strong>Division:</strong> {sub.division || 'N/A'}</div>
                    <div><strong>Department:</strong> {sub.department || 'N/A'}</div>
                    <div><strong>Submitted At:</strong> {sub.submittedAt?.toDate().toLocaleString() || 'N/A'}</div>
                    <div><strong>Aligns w/ Shifts?:</strong> {sub.alignsWithShifts ? sub.alignsWithShifts.toUpperCase() : 'N/A'}</div>
                </div>
                {/* Shift/Non-shift details, files, AI sections etc. are the same as before */}
                {sub.alignsWithShifts === 'yes' && (
                  <div className="mb-4 space-y-2 text-sm bg-teal-50 p-4 rounded border border-teal-200 text-gray-800">
                    <h4 className="font-semibold text-teal-800 text-base mb-1">Systemic Shift Details:</h4>
                     <p><strong>Key Shifts:</strong> {sub.keyShifts?.join(', ') || 'None selected'}</p>
                    {sub.focusAreas?.length > 0 && <p><strong>Focus Areas (Advantaged Barrels):</strong> {sub.focusAreas.join(', ')}</p>}
                    <p><strong>Case for Change:</strong> {sub.caseForChange || 'N/A'}</p>
                    <p><strong>Desired End State:</strong> {sub.desiredEndState || 'N/A'}</p>
                    <p><strong>Mindsets Cultivated:</strong> {sub.desiredMindset?.join(', ') || 'None selected'}</p>
                    <p><strong>Mindset Explanation:</strong> {sub.mindsetExplanation || 'N/A'}</p>
                  </div>
                )}
                 <div className="mb-4 text-sm text-gray-700">
                    <h4 className="font-semibold text-gray-800 text-base mb-2">Attached Files:</h4>
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
                 <div className="text-xs text-gray-600 border-t pt-2 mt-4">
                    <p><strong>Acknowledgement & Consent Given:</strong> {sub.acknowledgement ? 'Yes' : 'No'}</p>
                 </div>
                <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Generated Write-up:</h4>
                       <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 whitespace-pre-wrap h-60 overflow-y-auto">
                           {sub.aiGeneratedWriteup && !sub.aiGeneratedWriteup.includes('failed:') ? sub.aiGeneratedWriteup : <span className="text-red-500 italic">{sub.aiGeneratedWriteup || 'Not generated yet.'}</span>}
                       </div>
                   </div>
                   <div>
                       <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Infographic Concept:</h4>
                       <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 whitespace-pre-wrap h-60 overflow-y-auto">
                           <InfographicConceptDisplay concept={sub.aiInfographicConcept} />
                       </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-between items-center">
            <button
                onClick={() => fetchSubmissions('prev')}
                disabled={currentPage === 1}
                className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                Previous (First Page)
            </button>
            <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
            <button
                onClick={() => fetchSubmissions('next')}
                disabled={currentPage === totalPages || !lastVisible}
                className="bg-teal-600 text-white font-semibold py-2 px-4 rounded transition-colors hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
      </section>
  );
}
