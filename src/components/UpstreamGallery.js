'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db, storage } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CATEGORIES = ['All', 'Stock Images', 'Events', 'Team Photos', 'Infographics', 'Operations', 'Facilities'];
const IMAGES_PER_PAGE = 12;

export default function UpstreamGallery() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [goToPageInput, setGoToPageInput] = useState('');
  const pageSnapshotsRef = useRef({});

  // Upload State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [entryMode, setEntryMode] = useState(null); // 'manual' or 'auto' or null
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    file: null,
    title: '',
    category: 'Stock Images',
    tags: ''
  });

  // Fetch images function
  const fetchImages = async (pageDirection = 'first', targetPageNum = null) => {
    setLoading(true);
    setError('');

    try {
      const galleryRef = collection(db, 'upstreamGallery');
      let q;
      let newPage = currentPage;

      // Build base query with optional category filter
      const buildBaseQuery = () => {
        if (selectedCategory === 'All') {
          return galleryRef;
        } else {
          return query(galleryRef, where('category', '==', selectedCategory));
        }
      };

      const baseQuery = buildBaseQuery();

      if (pageDirection === 'first') {
        const countSnapshot = await getCountFromServer(baseQuery);
        setTotalDocs(countSnapshot.data().count);
        q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(IMAGES_PER_PAGE));
        newPage = 1;
        pageSnapshotsRef.current = { 1: null };
      } else if (pageDirection === 'next' && lastVisible) {
        q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(lastVisible), limit(IMAGES_PER_PAGE));
        newPage = currentPage + 1;
      } else if (pageDirection === 'prev') {
        const prevPage = currentPage - 1;
        if (prevPage >= 1 && pageSnapshotsRef.current[prevPage] !== undefined) {
          const prevSnapshot = pageSnapshotsRef.current[prevPage];
          if (prevSnapshot === null) {
            q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(IMAGES_PER_PAGE));
          } else {
            q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(prevSnapshot), limit(IMAGES_PER_PAGE));
          }
          newPage = prevPage;
        } else {
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(IMAGES_PER_PAGE));
          newPage = 1;
        }
      } else if (pageDirection === 'jump' && targetPageNum !== null) {
        const targetPage = targetPageNum;
        const totalPages = Math.ceil(totalDocs / IMAGES_PER_PAGE);

        if (targetPage < 1 || (totalPages > 0 && targetPage > totalPages)) {
          setLoading(false);
          return;
        }

        const prevPage = targetPage - 1;
        if (prevPage === 0) {
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(IMAGES_PER_PAGE));
          newPage = targetPage;
        } else if (pageSnapshotsRef.current[prevPage] !== undefined) {
          const prevSnapshot = pageSnapshotsRef.current[prevPage];
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(prevSnapshot), limit(IMAGES_PER_PAGE));
          newPage = targetPage;
        } else {
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
            let currentSnapshot = closestSnapshot;
            let currentPageNum = closestPage;

            while (currentPageNum < targetPage) {
              if (currentSnapshot === null) {
                q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(IMAGES_PER_PAGE));
              } else {
                q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(currentSnapshot), limit(IMAGES_PER_PAGE));
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
          } else {
            let currentSnapshot = null;
            let currentPageNum = 0;

            while (currentPageNum < targetPage) {
              if (currentSnapshot === null) {
                q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(IMAGES_PER_PAGE));
              } else {
                q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(currentSnapshot), limit(IMAGES_PER_PAGE));
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

      const querySnapshot = await getDocs(q);
      const fetchedImages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setImages(fetchedImages);
      setCurrentPage(newPage);

      if (querySnapshot.docs.length > 0) {
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(newLastVisible);
        pageSnapshotsRef.current[newPage] = newLastVisible;
      }

    } catch (err) {
      console.error("Error fetching images:", err);
      setError('Failed to load images.');
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  useEffect(() => {
    if (isLoggedIn) {
      fetchImages('first');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Initial load and login check
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      router.push('/login?redirect=/nexushub/upg');
      return;
    }

    fetchImages('first');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setUploadFormData(prev => ({ ...prev, file }));
      setEntryMode(null); // Reset entry mode when new file is selected
    }
  };

  // Handle AI analysis
  const handleAIAnalysis = async () => {
    if (!uploadFormData.file) {
      alert('Please select an image file first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // First, upload image to get a public URL for analysis
      const fileExt = uploadFormData.file.name.split('.').pop();
      const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
      const tempStoragePath = `upstreamGallery/temp/${tempFilename}`;

      console.log('[AI Analysis] Step 1: Uploading image to temporary storage...');
      // Upload to Firebase Storage (temporary location)
      const tempStorageRef = ref(storage, tempStoragePath);
      await uploadBytes(tempStorageRef, uploadFormData.file);
      const tempImageUrl = await getDownloadURL(tempStorageRef);
      console.log('[AI Analysis] Step 1: Image uploaded successfully, URL:', tempImageUrl.substring(0, 100));

      // Call analyzeImage Cloud Function
      const analyzeFunctionUrl = "https://analyzeimage-el2jwxb5bq-uc.a.run.app";
      
      console.log('[AI Analysis] Step 2: Calling Cloud Function...');
      console.log('[AI Analysis] Function URL:', analyzeFunctionUrl);
      console.log('[AI Analysis] Image URL length:', tempImageUrl.length);
      
      let response;
      try {
        response = await fetch(analyzeFunctionUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: tempImageUrl })
        });
        console.log('[AI Analysis] Step 2: Response received, status:', response.status, 'ok:', response.ok);
      } catch (fetchError) {
        console.error('[AI Analysis] Fetch error details:', {
          message: fetchError.message,
          name: fetchError.name,
          type: fetchError.constructor.name,
          stack: fetchError.stack
        });
        
        // Distinguish between different error types
        let errorMessage = 'Unknown network error';
        if (fetchError.message.includes('Failed to fetch')) {
          // This could be: network down, CORS blocked, function not accessible
          errorMessage = 'Unable to connect to the AI service. This could be due to:\n' +
            '• Network connectivity issues\n' +
            '• The function may need to be redeployed\n' +
            '• CORS configuration issue\n\n' +
            'Please try again or use manual entry.';
        } else if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Network request failed')) {
          errorMessage = 'Network error: Unable to reach the server. Please check your internet connection.';
        } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          errorMessage = 'Network request failed. Please check your internet connection and try again.';
        } else {
          errorMessage = `Network error: ${fetchError.message}`;
        }
        
        throw new Error(errorMessage);
      }

      // Handle HTTP error responses
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        let errorDetails = '';
        let errorData = null;
        
        // Try to get the response body
        try {
          const responseText = await response.text();
          console.log('[AI Analysis] Raw error response:', responseText);
          
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
              console.log('[AI Analysis] Parsed error data:', errorData);
            } catch (parseErr) {
              // If not JSON, use the text as the error message
              errorMessage = responseText.substring(0, 200);
              errorDetails = responseText;
            }
          }
        } catch (textError) {
          console.error('[AI Analysis] Failed to read error response:', textError);
          errorDetails = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // Extract error message from parsed data
        if (errorData) {
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' 
              ? errorData.error 
              : errorData.error.message || JSON.stringify(errorData.error);
          }
          
          if (errorData.details) {
            errorDetails = errorData.details;
          }
        }
        
        // Provide specific error messages based on status code (only if we don't have a better message)
        if (errorMessage === `Server error (${response.status})`) {
          if (response.status === 403) {
            errorMessage = 'Access denied. The function may need to be configured for public access.';
          } else if (response.status === 404) {
            errorMessage = 'Function not found. The function may need to be redeployed.';
          } else if (response.status === 500) {
            errorMessage = errorData?.message || 'Server error occurred while analyzing the image. Please try again.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. ' + (errorDetails || 'Please check the image URL.');
          }
        }
        
        console.error('[AI Analysis] Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage || 'No error message',
          errorDetails: errorDetails || 'No details',
          errorData: errorData || 'No error data'
        });
        
        throw new Error(errorMessage || `Server returned error status ${response.status}`);
      }

      // Parse successful response
      let analysisData;
      try {
        analysisData = await response.json();
        console.log('[AI Analysis] Step 3: Analysis data received:', {
          success: analysisData.success,
          category: analysisData.category,
          tagsCount: analysisData.tags?.length || 0
        });
      } catch (parseError) {
        console.error('[AI Analysis] JSON parse error:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (analysisData.success) {
        // Auto-fill form with AI suggestions
        setUploadFormData(prev => ({
          ...prev,
          title: prev.title || uploadFormData.file.name.replace(/\.[^/.]+$/, ''), // Use filename if no title
          category: analysisData.category || prev.category,
          tags: analysisData.tags ? analysisData.tags.join(', ') : prev.tags
        }));
        setEntryMode('auto');
        console.log('[AI Analysis] Step 4: Form auto-filled successfully');
      } else {
        throw new Error(analysisData.error || 'Analysis failed - no data returned');
      }

    } catch (err) {
      console.error("[AI Analysis] Error in AI analysis:", {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Set error state for UI display
      const userFriendlyMessage = err.message || 'An unexpected error occurred';
      setError('AI analysis failed. You can still fill in the form manually.');
      
      // Show alert with detailed error
      alert(`AI Analysis Failed\n\n${userFriendlyMessage}\n\nYou can still fill in the form manually.`);
      
      // Fallback to manual mode
      setEntryMode('manual');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle manual entry mode
  const handleManualEntry = () => {
    setEntryMode('manual');
    // Reset form to defaults if needed
    if (!uploadFormData.title) {
      setUploadFormData(prev => ({
        ...prev,
        title: prev.file ? prev.file.name.replace(/\.[^/.]+$/, '') : '',
        category: 'Stock Images',
        tags: ''
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({ ...prev, [name]: value }));
  };

  // Upload image function
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFormData.file || !uploadFormData.title.trim() || !uploadFormData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Generate unique filename
      const fileExt = uploadFormData.file.name.split('.').pop();
      const sanitizedTitle = uploadFormData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${Date.now()}_${sanitizedTitle}.${fileExt}`;
      const storagePath = `upstreamGallery/images/${filename}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, storagePath);
      setUploadProgress(30);
      await uploadBytes(storageRef, uploadFormData.file);
      setUploadProgress(60);
      const downloadURL = await getDownloadURL(storageRef);
      setUploadProgress(80);

      // Get image dimensions (optional)
      const img = new window.Image();
      img.src = downloadURL;
      await new Promise((resolve) => {
        img.onload = () => resolve();
      });

      // Parse tags
      const tags = uploadFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create Firestore document
      const docData = {
        title: uploadFormData.title.trim(),
        category: uploadFormData.category,
        tags: tags,
        imageUrl: downloadURL,
        uploadedBy: 'Admin', // You can get this from sessionStorage if needed
        uploadedAt: serverTimestamp(),
        fileSize: uploadFormData.file.size,
        dimensions: {
          width: img.width,
          height: img.height
        }
      };

      await addDoc(collection(db, 'upstreamGallery'), docData);
      setUploadProgress(100);

      // Reset form and refresh gallery
      setUploadFormData({
        file: null,
        title: '',
        category: 'Stock Images',
        tags: ''
      });
      setEntryMode(null);
      setShowUploadForm(false);
      
      // Reset file input
      const fileInput = document.getElementById('imageFile');
      if (fileInput) fileInput.value = '';

      // Refresh gallery
      await fetchImages('first');
      
      alert('Image uploaded successfully!');
    } catch (err) {
      console.error("Error uploading image:", err);
      setError('Failed to upload image. Please try again.');
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Download image function
  const downloadImage = async (image) => {
    if (!image.imageUrl) {
      alert('Image URL is not available.');
      return;
    }

    const title = (image.title || 'image').replace(/[^a-z0-9]/gi, '_');
    const url = image.imageUrl;
    
    // Extract file extension from URL
    let ext = 'jpg';
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      if (match) ext = match[1].toLowerCase();
    } catch (e) {
      // Use default
    }

    const filename = `${title}.${ext}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });

      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (fetchErr) {
      console.warn('Fetch failed, trying direct download:', fetchErr);
    }

    // Fallback: direct download link
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
      window.open(url, '_blank');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-xl">Redirecting to login...</p>
      </div>
    );
  }

  if (loading && images.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <p className="text-gray-600 text-xl">Loading Gallery...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalDocs / IMAGES_PER_PAGE);

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 border-b pb-2">Upstream Gallery</h2>
        {isLoggedIn && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-teal-600 text-white font-semibold py-2 px-4 rounded transition-colors hover:bg-teal-700"
          >
            {showUploadForm ? 'Cancel Upload' : '+ Upload Image'}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Upload Form */}
      {showUploadForm && isLoggedIn && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload New Image</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                Image File *
              </label>
              <input
                id="imageFile"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* Manual/Auto Toggle - Show after file selection */}
            {uploadFormData.file && entryMode === null && (
              <div className="p-4 bg-white rounded-lg border border-gray-300">
                <p className="text-sm font-medium text-gray-700 mb-3">Choose how to fill in the details:</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleManualEntry}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors hover:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    <span>📝 Manual Entry</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAIAnalysis}
                    disabled={analyzing}
                    className="flex-1 bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖 Auto (AI)</span>
                      </>
                    )}
                  </button>
                </div>
                {analyzing && (
                  <p className="text-xs text-gray-500 mt-2 text-center">AI is analyzing your image to suggest tags and category...</p>
                )}
              </div>
            )}

            {/* Show form fields when entry mode is selected */}
            {entryMode !== null && (
              <>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={uploadFormData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                placeholder="Enter image title"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={uploadFormData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
              >
                {CATEGORIES.filter(cat => cat !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={uploadFormData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
                placeholder="e.g., team, event, 2025"
              />
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Uploading...</span>
                  <span className="text-sm text-gray-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || entryMode === null}
              className="bg-teal-600 text-white font-semibold py-2 px-6 rounded transition-colors hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* Category Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedCategory === category
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {images.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No images found in this category.</p>
          {isLoggedIn && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-4 bg-teal-600 text-white font-semibold py-2 px-4 rounded transition-colors hover:bg-teal-700"
            >
              Upload First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group relative"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={image.imageUrl}
                  alt={image.title || 'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={(e) => {
                    console.error('Image load error:', image.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => downloadImage(image)}
                    className="bg-teal-600 text-white font-semibold py-2 px-4 rounded transition-colors hover:bg-teal-700"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 truncate" title={image.title}>
                  {image.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{image.category}</p>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => fetchImages('first')}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="First page"
            >
              ««
            </button>

            <button
              onClick={() => fetchImages('prev')}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Previous page"
            >
              «
            </button>

            {(() => {
              const pages = [];
              const maxVisible = 5;

              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              if (startPage > 1) {
                pages.push(
                  <button
                    key="page-1"
                    onClick={() => fetchImages('jump', 1)}
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

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={`page-${i}`}
                    onClick={() => fetchImages('jump', i)}
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
                    onClick={() => fetchImages('jump', totalPages)}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors hover:bg-gray-300"
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            <button
              onClick={() => fetchImages('next')}
              disabled={currentPage === totalPages || !lastVisible}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Next page"
            >
              »
            </button>

            <button
              onClick={() => {
                const lastPage = Math.ceil(totalDocs / IMAGES_PER_PAGE);
                fetchImages('jump', lastPage);
              }}
              disabled={currentPage === totalPages || !lastVisible}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Last page"
            >
              »»
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalDocs} total)
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="goToPage" className="text-sm text-gray-700">Go to:</label>
              <input
                id="goToPage"
                type="number"
                min="1"
                max={totalPages}
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(goToPageInput);
                    if (page >= 1 && page <= totalPages) {
                      fetchImages('jump', page);
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
                  if (page >= 1 && page <= totalPages) {
                    fetchImages('jump', page);
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
      )}
    </section>
  );
}

