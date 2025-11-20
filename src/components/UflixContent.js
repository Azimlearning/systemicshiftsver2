'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { FaPlay, FaFilter } from 'react-icons/fa';

const SERIES = ['All', 'Systemic Shifts Unplugged', 'Other'];
const VIDEOS_PER_PAGE = 12;

export default function UflixContent() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All');
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [goToPageInput, setGoToPageInput] = useState('');
  const pageSnapshotsRef = useRef({});

  // Video player state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Fetch videos function
  const fetchVideos = async (pageDirection = 'first', targetPageNum = null) => {
    setLoading(true);
    setError('');

    try {
      const videosRef = collection(db, 'ulearn_videos');
      let q;
      let newPage = currentPage;

      // Build base query with optional series filter
      const buildBaseQuery = () => {
        if (selectedSeries === 'All') {
          return videosRef;
        } else {
          return query(videosRef, where('series', '==', selectedSeries));
        }
      };

      const baseQuery = buildBaseQuery();

      if (pageDirection === 'first') {
        const countSnapshot = await getCountFromServer(baseQuery);
        setTotalDocs(countSnapshot.data().count);
        q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(VIDEOS_PER_PAGE));
        newPage = 1;
        pageSnapshotsRef.current = { 1: null };
      } else if (pageDirection === 'next' && lastVisible) {
        q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(lastVisible), limit(VIDEOS_PER_PAGE));
        newPage = currentPage + 1;
      } else if (pageDirection === 'prev') {
        const prevPage = currentPage - 1;
        if (prevPage >= 1 && pageSnapshotsRef.current[prevPage] !== undefined) {
          const prevSnapshot = pageSnapshotsRef.current[prevPage];
          if (prevSnapshot === null) {
            q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(VIDEOS_PER_PAGE));
          } else {
            q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(prevSnapshot), limit(VIDEOS_PER_PAGE));
          }
          newPage = prevPage;
        } else {
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(VIDEOS_PER_PAGE));
          newPage = 1;
        }
      } else if (pageDirection === 'jump' && targetPageNum !== null) {
        const targetPage = targetPageNum;
        const totalPages = Math.ceil(totalDocs / VIDEOS_PER_PAGE);

        if (targetPage < 1 || (totalPages > 0 && targetPage > totalPages)) {
          setLoading(false);
          return;
        }

        const prevPage = targetPage - 1;
        if (prevPage === 0) {
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), limit(VIDEOS_PER_PAGE));
          newPage = targetPage;
        } else if (pageSnapshotsRef.current[prevPage] !== undefined) {
          const prevSnapshot = pageSnapshotsRef.current[prevPage];
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(prevSnapshot), limit(VIDEOS_PER_PAGE));
          newPage = targetPage;
        } else {
          // Sequential fetch to build snapshots
          let currentSnapshot = null;
          for (let i = 1; i < targetPage; i++) {
            if (pageSnapshotsRef.current[i] !== undefined) {
              currentSnapshot = pageSnapshotsRef.current[i];
              continue;
            }
            const tempQ = currentSnapshot === null
              ? query(baseQuery, orderBy('uploadedAt', 'desc'), limit(VIDEOS_PER_PAGE))
              : query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(currentSnapshot), limit(VIDEOS_PER_PAGE));
            const tempSnapshot = await getDocs(tempQ);
            currentSnapshot = tempSnapshot.docs[tempSnapshot.docs.length - 1] || currentSnapshot;
            pageSnapshotsRef.current[i] = currentSnapshot;
          }
          q = query(baseQuery, orderBy('uploadedAt', 'desc'), startAfter(currentSnapshot), limit(VIDEOS_PER_PAGE));
          newPage = targetPage;
        }
      }

      const querySnapshot = await getDocs(q);
      const fetchedVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setVideos(fetchedVideos);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      pageSnapshotsRef.current[newPage] = lastDoc;
      setCurrentPage(newPage);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  // Handle series filter change
  const handleSeriesChange = (series) => {
    setSelectedSeries(series);
    setCurrentPage(1);
    setLastVisible(null);
    pageSnapshotsRef.current = {};
  };

  // Fetch videos when series changes
  useEffect(() => {
    fetchVideos('first');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeries]);

  // Handle video play
  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <p className="text-gray-600 text-xl">Loading Videos...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalDocs / VIDEOS_PER_PAGE);

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 border-b pb-2">Uflix</h2>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Series Filter */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <FaFilter className="text-gray-600" />
        <span className="text-gray-700 font-medium mr-2">Series:</span>
        {SERIES.map(series => (
          <button
            key={series}
            onClick={() => handleSeriesChange(series)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedSeries === series
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {series}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {videos.length === 0 && !loading ? (
        <p className="text-gray-600 text-center py-12">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => handlePlayVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-800">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaPlay className="text-gray-600 text-4xl group-hover:text-teal-500 transition-colors" />
                  </div>
                )}
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="bg-teal-600 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaPlay className="text-white text-xl ml-1" />
                  </div>
                </div>
                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 line-clamp-2">{video.title || 'Untitled'}</h3>
                {video.series && (
                  <p className="text-teal-400 text-xs mb-2">{video.series}</p>
                )}
                {video.episodeNumber && (
                  <p className="text-gray-400 text-xs">Episode {video.episodeNumber}</p>
                )}
                {video.description && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{video.description}</p>
                )}
                {video.uploadedAt && (
                  <p className="text-gray-500 text-xs mt-2">
                    {video.uploadedAt.toDate ? video.uploadedAt.toDate().toLocaleDateString() : 'N/A'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => fetchVideos('first')}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="First page"
            >
              ««
            </button>
            <button
              onClick={() => fetchVideos('prev')}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Previous page"
            >
              «
            </button>

            {/* Page Number Buttons */}
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
                    key={1}
                    onClick={() => fetchVideos('jump', 1)}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded hover:bg-gray-300"
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pages.push(<span key="ellipsis1" className="px-2">...</span>);
                }
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => fetchVideos('jump', i)}
                    className={`font-semibold py-2 px-3 rounded transition-colors ${
                      i === currentPage
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i}
                  </button>
                );
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(<span key="ellipsis2" className="px-2">...</span>);
                }
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => fetchVideos('jump', totalPages)}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded hover:bg-gray-300"
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            <button
              onClick={() => fetchVideos('next')}
              disabled={currentPage === totalPages || !lastVisible}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-300"
              title="Next page"
            >
              »
            </button>
            <button
              onClick={() => {
                const lastPage = Math.ceil(totalDocs / VIDEOS_PER_PAGE);
                fetchVideos('jump', lastPage);
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
                max={Math.ceil(totalDocs / VIDEOS_PER_PAGE)}
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const pageNum = parseInt(goToPageInput);
                    if (pageNum >= 1 && pageNum <= totalPages) {
                      fetchVideos('jump', pageNum);
                      setGoToPageInput('');
                    }
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Page #"
              />
              <button
                onClick={() => {
                  const pageNum = parseInt(goToPageInput);
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    fetchVideos('jump', pageNum);
                    setGoToPageInput('');
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

      {/* Video Player Modal */}
      {isPlayerOpen && selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setIsPlayerOpen(false)}
        >
          <div
            className="bg-gray-900 rounded-lg max-w-4xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">{selectedVideo.title}</h3>
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="aspect-video bg-black rounded overflow-hidden">
              {selectedVideo.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Video URL not available
                </div>
              )}
            </div>
            {selectedVideo.description && (
              <p className="text-gray-300 mt-4">{selectedVideo.description}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

