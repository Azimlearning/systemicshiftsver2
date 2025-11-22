'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '../lib/firebase'; 
import { collection, getDocs, query, orderBy, limit, startAfter, endBefore, deleteDoc, doc, getCountFromServer, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function SystemicShiftsDropbox() {
  // Initialize login state - always start with false to avoid hydration mismatch
  // Will be updated in useEffect (client-side only)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(null); // Track which submission's menu is open

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [goToPageInput, setGoToPageInput] = useState('');
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
    // Show spinner if:
    // 1. Has submittedAt but no analysisTimestamp (AI analysis not started)
    // 2. Has analysisTimestamp but image is still pending (image generation in progress)
    const hasNoAnalysis = sub.submittedAt && !sub.analysisTimestamp;
    const imagePending = sub.analysisTimestamp && 
                         (sub.aiGeneratedImageUrl === "Pending local generation" || 
                          !sub.aiGeneratedImageUrl || 
                          (sub.aiGeneratedImageUrl && !sub.aiGeneratedImageUrl.startsWith('http')));
    return hasNoAnalysis || imagePending;
  };

  // Store page snapshots for navigation
  const pageSnapshotsRef = useRef({});
  
  // Simple fetch function using getDocs (like old code)
  const fetchSubmissions = async (pageDirection = 'first', targetPageNum = null, retryCount = 0) => {
    setLoading(true);
    setError('');
    
    try {
      const storiesRef = collection(db, 'stories');
      let q;
      let newPage = currentPage;

      if (pageDirection === 'first') {
        const countSnapshot = await getCountFromServer(storiesRef);
        setTotalDocs(countSnapshot.data().count);
        q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
        newPage = 1;
        pageSnapshotsRef.current = { 1: null }; // Reset snapshots
      } else if (pageDirection === 'next' && lastVisible) {
        q = query(storiesRef, orderBy('submittedAt', 'desc'), startAfter(lastVisible), limit(docsPerPage));
        newPage = currentPage + 1;
      } else if (pageDirection === 'prev') {
        const prevPage = currentPage - 1;
        if (prevPage >= 1 && pageSnapshotsRef.current[prevPage] !== undefined) {
          const prevSnapshot = pageSnapshotsRef.current[prevPage];
          if (prevSnapshot === null) {
            q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
          } else {
            q = query(storiesRef, orderBy('submittedAt', 'desc'), startAfter(prevSnapshot), limit(docsPerPage));
          }
          newPage = prevPage;
        } else {
          // Fallback to first page
          q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
          newPage = 1;
        }
      } else if (pageDirection === 'jump' && targetPageNum !== null) {
        const targetPage = targetPageNum;
        const totalPages = Math.ceil(totalDocs / docsPerPage);
        
        if (targetPage < 1 || (totalPages > 0 && targetPage > totalPages)) {
          setLoading(false);
          return;
        }
        
        // If we have the snapshot for the previous page, use it
        const prevPage = targetPage - 1;
        if (prevPage === 0) {
          q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
          newPage = targetPage;
        } else if (pageSnapshotsRef.current[prevPage] !== undefined) {
          const prevSnapshot = pageSnapshotsRef.current[prevPage];
          q = query(storiesRef, orderBy('submittedAt', 'desc'), startAfter(prevSnapshot), limit(docsPerPage));
          newPage = targetPage;
        } else {
          // Don't have snapshot - navigate sequentially from closest page
          let closestPage = null;
          let closestSnapshot = null;
          
          for (let i = prevPage; i >= 1; i--) {
            if (pageSnapshotsRef.current[i] !== undefined) {
              closestPage = i;
              closestSnapshot = pageSnapshotsRef.current[i];
              break;
            }
          }
          
          if (closestPage !== null && closestSnapshot !== null) {
            // Navigate from closest page to target
            let currentSnapshot = closestSnapshot;
            let currentPageNum = closestPage;
            
            while (currentPageNum < targetPage) {
              if (currentSnapshot === null) {
                q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
              } else {
                q = query(storiesRef, orderBy('submittedAt', 'desc'), startAfter(currentSnapshot), limit(docsPerPage));
              }
              
              const querySnapshot = await getDocs(q);
              if (querySnapshot.docs.length > 0) {
                currentSnapshot = querySnapshot.docs[querySnapshot.docs.length - 1];
                currentPageNum++;
                pageSnapshotsRef.current[currentPageNum] = currentSnapshot;
              } else {
                break;
              }
            }
            
            newPage = currentPageNum;
            // Use the last query we created
          } else {
            // Start from first page and navigate forward
            let currentSnapshot = null;
            let currentPageNum = 0;
            
            while (currentPageNum < targetPage) {
              if (currentSnapshot === null) {
                q = query(storiesRef, orderBy('submittedAt', 'desc'), limit(docsPerPage));
              } else {
                q = query(storiesRef, orderBy('submittedAt', 'desc'), startAfter(currentSnapshot), limit(docsPerPage));
              }
              
              const querySnapshot = await getDocs(q);
              if (querySnapshot.docs.length > 0) {
                currentSnapshot = querySnapshot.docs[querySnapshot.docs.length - 1];
                currentPageNum++;
                pageSnapshotsRef.current[currentPageNum] = currentSnapshot;
              } else {
                break;
              }
            }
            
            newPage = currentPageNum;
          }
        }
      }

      // Execute the query
      const querySnapshot = await getDocs(q);
      const fetchedSubmissions = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      setSubmissions(fetchedSubmissions);
      setCurrentPage(newPage);
      
      if (querySnapshot.docs.length > 0) {
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(newLastVisible);
        pageSnapshotsRef.current[newPage] = newLastVisible;
      }

    } catch (err) {
      console.error("Error fetching submissions:", err);
      if (retryCount < 2) {
        // Retry after 1 second
        setTimeout(() => fetchSubmissions(pageDirection, targetPageNum, retryCount + 1), 1000);
      } else {
        setError('Failed to load submissions. Please refresh the page.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check login status on client side only (avoids hydration mismatch)
    if (typeof window === 'undefined' || isNavigating) return;
    
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    // Update login state - necessary for client-side sessionStorage check
    // This is a valid use case: checking client-side storage and updating state accordingly
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      setIsNavigating(true);
      router.push('/login?redirect=/nexushub/dropbox');
      return;
    }
    
    // Fetch initial submissions
    fetchSubmissions('first');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isNavigating]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadMenuOpen && !event.target.closest('.download-menu-container')) {
        setDownloadMenuOpen(null);
      }
    };
    
    if (downloadMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [downloadMenuOpen]);

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

  // Download functions
  const downloadFile = (content, filename, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAIWriteup = (sub) => {
    if (!sub.aiGeneratedWriteup || sub.aiGeneratedWriteup.includes('failed')) {
      alert('AI Writeup is not available for download.');
      return;
    }
    const title = (sub.storyTitle || sub.nonShiftTitle || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    downloadFile(sub.aiGeneratedWriteup, `${title}_AI_Writeup.txt`, 'text/plain');
  };

  const downloadAIConcept = (sub) => {
    if (!sub.aiInfographicConcept || sub.aiInfographicConcept.error) {
      alert('AI Infographic Concept is not available for download.');
      return;
    }
    const title = (sub.storyTitle || sub.nonShiftTitle || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    const jsonContent = JSON.stringify(sub.aiInfographicConcept, null, 2);
    downloadFile(jsonContent, `${title}_AI_Infographic_Concept.json`, 'application/json');
  };

  const downloadAIImage = async (sub) => {
    if (!sub.aiGeneratedImageUrl || !sub.aiGeneratedImageUrl.startsWith('http')) {
      alert('AI Image is not available for download.');
      return;
    }
    
    const title = (sub.storyTitle || sub.nonShiftTitle || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    const filename = `${title}_AI_Image.png`;
    
    try {
      // Try to fetch and download with proper filename
      const response = await fetch(sub.aiGeneratedImageUrl, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (fetchErr) {
      console.warn('Fetch failed for AI image, trying direct download link:', fetchErr);
    }
    
    // Fallback: Create direct download link (works for public Firebase Storage URLs)
    try {
      const a = document.createElement('a');
      a.href = sub.aiGeneratedImageUrl;
      a.download = filename;
      a.target = '_blank'; // Open in new tab if download doesn't work
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
      // Last resort: open in new tab
      window.open(sub.aiGeneratedImageUrl, '_blank');
    }
  };

  const downloadFullDetails = (sub) => {
    const title = (sub.storyTitle || sub.nonShiftTitle || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    
    // Format submission details as readable text
    let detailsText = `SUBMISSION DETAILS\n`;
    detailsText += `==================\n\n`;
    detailsText += `Title: ${sub.storyTitle || sub.nonShiftTitle || 'N/A'}\n`;
    detailsText += `Submitter: ${sub.fullName || 'N/A'}\n`;
    detailsText += `Division: ${sub.division || 'N/A'}\n`;
    detailsText += `Department: ${sub.department || 'N/A'}\n`;
    detailsText += `Submitted At: ${sub.submittedAt?.toDate().toLocaleString() || 'N/A'}\n`;
    detailsText += `Aligns with Shifts: ${sub.alignsWithShifts || 'N/A'}\n\n`;
    
    if (sub.alignsWithShifts === 'yes') {
      detailsText += `Key Shifts: ${sub.keyShifts?.join(', ') || 'N/A'}\n`;
      detailsText += `Case for Change: ${sub.caseForChange || 'N/A'}\n`;
      detailsText += `Focus Areas: ${sub.focusAreas?.join(', ') || 'N/A'}\n`;
      detailsText += `Desired Mindset: ${sub.desiredMindset?.join(', ') || 'N/A'}\n`;
      detailsText += `Mindset Explanation: ${sub.mindsetExplanation || 'N/A'}\n\n`;
    } else {
      detailsText += `Non-Shift Description: ${sub.nonShiftDescription || 'N/A'}\n\n`;
    }
    
    detailsText += `AI Generated Write-up:\n`;
    detailsText += `${sub.aiGeneratedWriteup || 'Not generated yet.'}\n\n`;
    
    detailsText += `AI Infographic Concept:\n`;
    detailsText += `${JSON.stringify(sub.aiInfographicConcept, null, 2) || 'Not generated yet.'}\n\n`;
    
    detailsText += `AI Generated Image URL: ${sub.aiGeneratedImageUrl || 'Not generated yet.'}\n\n`;
    
    detailsText += `Uploaded Documents:\n`;
    detailsText += `Write-up URL: ${sub.writeUpURL || 'N/A'}\n`;
    detailsText += `Visual URLs: ${sub.visualURLs?.join(', ') || 'N/A'}\n`;
    
    downloadFile(detailsText, `${title}_Full_Details.txt`, 'text/plain');
  };

  const downloadUploadedDocuments = async (sub) => {
    const urls = [];
    if (sub.writeUpURL) urls.push({ url: sub.writeUpURL, name: 'Write-up' });
    if (sub.visualURLs && Array.isArray(sub.visualURLs)) {
      sub.visualURLs.forEach((url, index) => {
        urls.push({ url, name: `Visual_${index + 1}` });
      });
    }
    
    if (urls.length === 0) {
      alert('No uploaded documents available for download.');
      return;
    }
    
    const title = (sub.storyTitle || sub.nonShiftTitle || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    
    for (const item of urls) {
      try {
        // Extract filename from URL
        let filename = `${title}_${item.name}`;
        try {
          const urlObj = new URL(item.url);
          const urlPath = decodeURIComponent(urlObj.pathname);
          
          // Handle Firebase Storage path format: /v0/b/bucket/o/path%2Fto%2Ffile
          if (urlPath.includes('/o/')) {
            const pathParts = urlPath.split('/');
            const oIndex = pathParts.indexOf('o');
            if (oIndex !== -1 && pathParts[oIndex + 1]) {
              filename = decodeURIComponent(pathParts[oIndex + 1]).split('?')[0];
              // Extract just the filename if it's a path
              if (filename.includes('/')) {
                filename = filename.split('/').pop();
              }
            }
          } else {
            // Try to get filename from end of path
            const pathParts = urlPath.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.length > 3 && !lastPart.includes('?')) {
              filename = lastPart;
            }
          }
        } catch (urlError) {
          console.warn('Error parsing URL for filename:', urlError);
        }
        
        // Try to download using fetch first
        try {
          const response = await fetch(item.url, {
            method: 'GET',
            mode: 'cors',
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            await new Promise(resolve => setTimeout(resolve, 300));
            continue;
          }
        } catch (fetchErr) {
          console.warn(`Fetch failed for ${item.name}, trying direct download link:`, fetchErr);
        }
        
        // Fallback: Create direct download link (works for public Firebase Storage URLs)
        const a = document.createElement('a');
        a.href = item.url;
        a.download = filename;
        a.target = '_blank'; // Open in new tab if download doesn't work
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Error downloading ${item.name}:`, err);
        // Last resort: open in new tab
        window.open(item.url, '_blank');
      }
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
                  {/* Action Buttons - Right side */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {/* Download Button */}
                    <div className="relative download-menu-container">
                      <button
                        onClick={() => setDownloadMenuOpen(downloadMenuOpen === sub.id ? null : sub.id)}
                        className="bg-teal-100 text-teal-700 hover:bg-teal-600 hover:text-white text-xs font-bold py-1 px-3 rounded-full transition-colors flex items-center gap-1"
                        title="Download options"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      
                      {/* Download Menu Dropdown */}
                      {downloadMenuOpen === sub.id && (
                        <div className="absolute right-0 top-10 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                downloadAIWriteup(sub);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              📄 AI Writeup
                            </button>
                            <button
                              onClick={() => {
                                downloadAIConcept(sub);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              📊 AI Infographic Concept
                            </button>
                            <button
                              onClick={() => {
                                downloadAIImage(sub);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              🖼️ AI Image
                            </button>
                            <button
                              onClick={() => {
                                downloadFullDetails(sub);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              📋 Full Details
                            </button>
                            <button
                              onClick={() => {
                                downloadUploadedDocuments(sub);
                                setDownloadMenuOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              📎 Uploaded Documents
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold py-1 px-3 rounded-full transition-colors"
                      title="Delete this submission"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-teal-700 mb-3 border-b pb-2 pr-40">
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

                  {/* Display AI Sections - Only Write-up and Image (2 columns) */}
                  <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* --- AI GENERATION STATUS --- */}
                    {isAnalysisPending ? (
                      <div className="md:col-span-2">
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
                        
                        {/* Column 2: AI Image Draft */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">AI Image Draft:</h4>
                          {sub.aiGeneratedImageUrl && 
                           (sub.aiGeneratedImageUrl.startsWith('http') || sub.aiGeneratedImageUrl.startsWith('https://storage.googleapis.com')) ? (
                            <div className="relative w-full h-60 bg-gray-100 rounded-lg overflow-hidden">
                              <Image 
                                src={sub.aiGeneratedImageUrl} 
                                alt="AI Infographic Draft" 
                                width={250} 
                                height={250} 
                                className="rounded-lg shadow-md w-full h-full object-contain"
                                onError={(e) => {
                                  console.error('Image load error:', sub.aiGeneratedImageUrl);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
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

        {/* Advanced Pagination Controls */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* First Page Button */}
            <button
              onClick={() => fetchSubmissions('first')}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="First page"
            >
              ««
            </button>
            
            {/* Previous Button */}
            <button
              onClick={() => fetchSubmissions('prev')}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Previous page"
            >
              «
            </button>
            
            {/* Page Number Buttons */}
            {(() => {
              const pages = [];
              const totalPages = Math.ceil(totalDocs / docsPerPage);
              const maxVisible = 5; // Show max 5 page numbers
              
              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);
              
              // Adjust start if we're near the end
              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }
              
              // Show ellipsis at start if needed
              if (startPage > 1) {
                pages.push(
                  <button
                    key="page-1"
                    onClick={() => fetchSubmissions('jump', 1)}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors hover:bg-gray-300"
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis-start" className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
              }
              
              // Show page numbers
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={`page-${i}`}
                    onClick={() => fetchSubmissions('jump', i)}
                    className={`font-semibold py-2 px-3 rounded transition-colors ${
                      i === currentPage
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              // Show ellipsis at end if needed
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis-end" className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                pages.push(
                  <button
                    key={`page-${totalPages}`}
                    onClick={() => fetchSubmissions('jump', totalPages)}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors hover:bg-gray-300"
                  >
                    {totalPages}
                  </button>
                );
              }
              
              return pages;
            })()}
            
            {/* Next Button */}
            <button
              onClick={() => fetchSubmissions('next')}
              disabled={currentPage === totalPages || !lastVisible}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Next page"
            >
              »
            </button>
            
            {/* Last Page Button */}
            <button
              onClick={() => {
                const lastPage = Math.ceil(totalDocs / docsPerPage);
                fetchSubmissions('jump', lastPage);
              }}
              disabled={currentPage === totalPages || !lastVisible}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Last page"
            >
              »»
            </button>
          </div>
          
          {/* Page Info and Go To Page */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalDocs} total)
            </span>
            
            {/* Go to Page Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="goToPage" className="text-sm text-gray-700">Go to:</label>
              <input
                id="goToPage"
                type="number"
                min="1"
                max={Math.ceil(totalDocs / docsPerPage)}
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(goToPageInput);
                    const totalPages = Math.ceil(totalDocs / docsPerPage);
                    if (page >= 1 && page <= totalPages) {
                      fetchSubmissions('jump', page);
                      setGoToPageInput('');
                    } else {
                      alert(`Please enter a page number between 1 and ${totalPages}`);
                    }
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Page #"
              />
              <button
                onClick={() => {
                  const page = parseInt(goToPageInput);
                  const totalPages = Math.ceil(totalDocs / docsPerPage);
                  if (page >= 1 && page <= totalPages) {
                    fetchSubmissions('jump', page);
                    setGoToPageInput('');
                  } else {
                    alert(`Please enter a page number between 1 and ${totalPages}`);
                  }
                }}
                className="bg-teal-600 text-white font-semibold py-1 px-3 rounded text-sm transition-colors hover:bg-teal-700"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </section>
  );
}
