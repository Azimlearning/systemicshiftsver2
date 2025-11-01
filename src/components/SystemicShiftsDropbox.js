'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '../lib/firebase'; 
import { collection, getDocs, query, orderBy, limit, startAfter, endBefore, deleteDoc, doc, getCountFromServer } from 'firebase/firestore';
import Link from 'next/link';

export default function SystemicShiftsDropbox() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const docsPerPage = 3;

  // NEW Helper component for loading
  const GeneratingIndicator = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg h-60">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent border-solid rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-teal-700 font-semibold">
        Generating Content...
      </p>
    </div>
  );

  // Helper to check if AI generation is still in progress
  const isGenerating = (sub) => {
    // If the submission has a submittedAt timestamp but no analysisTimestamp, it's generating.
    return sub.submittedAt && !sub.analysisTimestamp;
  };

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
        // This logic will go to the first page when 'prev' is clicked on page 2 or more.
        q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
        setCurrentPage(1);
      }

      const querySnapshot = await getDocs(q);
      const fetchedSubmissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(fetchedSubmissions);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
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
      fetchSubmissions('first');
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete submission.");
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-xl">Redirecting to login...</p>
      </div>
    );
  }

   if (loading && submissions.length === 0) {
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
            {submissions.map((sub) => {
              const isAnalysisPending = isGenerating(sub);

              return (
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
                      <div><strong>Submitter:</strong> {sub.fullName || 'N/A'}</div>
                      <div><strong>Division:</strong> {sub.division || 'N/A'}</div>
                      <div><strong>Department:</strong> {sub.department || 'N/A'}</div>
                      <div><strong>Submitted At:</strong> {sub.submittedAt?.toDate().toLocaleString() || 'N/A'}</div>
                      <div><strong>Aligns w/ Shifts?:</strong> {sub.alignsWithShifts ? sub.alignsWithShifts.toUpperCase() : 'N/A'}</div>
                  </div>
                  {/* ... (rest of submission metadata as before) ... */}

                  {/* Display AI Sections */}
                  <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* --- AI GENERATION STATUS --- */}
                    {isAnalysisPending ? (
                      <div className="md:col-span-3">
                        <GeneratingIndicator />
                      </div>
                    ) : (
                      <>
                        {/* Column 1: Write-up */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Generated Write-up:</h4>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 whitespace-pre-wrap h-60 overflow-y-auto">
                            {sub.aiGeneratedWriteup && !sub.aiGeneratedWriteup.includes('failed') ? (
                              sub.aiGeneratedWriteup
                            ) : (
                              <span className="text-red-600 italic">{sub.aiGeneratedWriteup || 'Not generated yet.'}</span>
                            )}
                          </div>
                        </div>

                        {/* Column 2: Infographic Concept */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Infographic Concept:</h4>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 whitespace-pre-wrap h-60 overflow-y-auto">
                            {sub.aiInfographicConcept?.error ? (
                              <span className="text-red-600 italic">AI infographic concept failed. {sub.aiInfographicConcept.rawResponse}</span>
                            ) : (
                              JSON.stringify(sub.aiInfographicConcept, null, 2) || <span className="text-gray-500 italic">Not generated yet.</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Column 3: AI Image Draft */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Image Draft:</h4>
                          {sub.aiGeneratedImageUrl && sub.aiGeneratedImageUrl.startsWith('http') ? (
                            <Image src={sub.aiGeneratedImageUrl} alt="AI Infographic Draft" width={250} height={250} className="rounded-lg shadow-md w-full h-auto object-cover" />
                          ) : (
                            <p className={`p-3 text-xs rounded whitespace-pre-wrap ${sub.aiGeneratedImageUrl && sub.aiGeneratedImageUrl.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {sub.aiGeneratedImageUrl || 'Image generation pending.'}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    {/* --- END STATUS --- */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-between items-center">
            <button
                onClick={() => fetchSubmissions('prev')}
                disabled={currentPage === 1}
                className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                Previous
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
