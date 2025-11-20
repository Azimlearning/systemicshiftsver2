'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, deleteDoc, doc, getCountFromServer } from 'firebase/firestore';
import { FaPodcast, FaPlay, FaPause, FaDownload, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa';

export default function MyPodcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const docsPerPage = 10;

  // Fetch podcasts from Firestore
  const fetchPodcasts = async (pageDirection = 'first') => {
    setLoading(true);
    setError('');

    try {
      const podcastsRef = collection(db, 'podcasts');
      let q;

      if (pageDirection === 'first') {
        const countSnapshot = await getCountFromServer(podcastsRef);
        setTotalDocs(countSnapshot.data().count);
        q = query(podcastsRef, orderBy('createdAt', 'desc'), limit(docsPerPage));
        setCurrentPage(1);
      } else if (pageDirection === 'next' && lastVisible) {
        q = query(podcastsRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(docsPerPage));
        setCurrentPage(prev => prev + 1);
      } else {
        q = query(podcastsRef, orderBy('createdAt', 'desc'), limit(docsPerPage));
        setCurrentPage(1);
      }

      const querySnapshot = await getDocs(q);
      const podcastsData = [];
      
      querySnapshot.forEach((doc) => {
        podcastsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setPodcasts(podcastsData);
      
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setLastVisible(null);
      }
    } catch (err) {
      console.error('Error fetching podcasts:', err);
      setError('Failed to load podcasts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  // Filter podcasts by search term
  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.outline?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle play/pause
  const handlePlayPause = (podcastId, audioUrl) => {
    if (playingId === podcastId) {
      // Pause current
      if (audioElements[podcastId]) {
        audioElements[podcastId].pause();
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (playingId && audioElements[playingId]) {
        audioElements[playingId].pause();
      }

      // Play new audio
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => setPlayingId(null));
        const newAudioElements = { ...audioElements, [podcastId]: audio };
        setAudioElements(newAudioElements);
        audio.play();
        setPlayingId(podcastId);
      }
    }
  };

  // Handle delete
  const handleDelete = async (podcastId) => {
    if (!window.confirm('Are you sure you want to delete this podcast? This action cannot be undone.')) {
      return;
    }

    try {
      // Stop audio if playing
      if (playingId === podcastId && audioElements[podcastId]) {
        audioElements[podcastId].pause();
        setPlayingId(null);
      }

      await deleteDoc(doc(db, 'podcasts', podcastId));
      
      // Remove from audio elements
      const newAudioElements = { ...audioElements };
      delete newAudioElements[podcastId];
      setAudioElements(newAudioElements);

      // Refresh list
      fetchPodcasts();
    } catch (err) {
      console.error('Error deleting podcast:', err);
      setError('Failed to delete podcast. Please try again.');
    }
  };

  // Handle download
  const handleDownload = (podcast, type) => {
    if (type === 'text') {
      let text = `Podcast: ${podcast.topic}\n\n`;
      if (podcast.outline) {
        text += `OUTLINE:\n${podcast.outline}\n\n`;
      }
      if (podcast.script) {
        text += `SCRIPT:\n${podcast.script}\n\n`;
      }
      if (podcast.sections) {
        podcast.sections.forEach((section, idx) => {
          text += `\nSection ${idx + 1}: ${section.title || 'Untitled'}\n`;
          if (section.content) text += `${section.content}\n`;
        });
      }

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podcast-${podcast.topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (type === 'json') {
      const scriptText = JSON.stringify(podcast, null, 2);
      const blob = new Blob([scriptText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podcast-${podcast.topic.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (type === 'audio' && podcast.audioUrl) {
      const a = document.createElement('a');
      a.href = podcast.audioUrl;
      a.download = `podcast-${podcast.topic.replace(/\s+/g, '-').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalDocs / docsPerPage);

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2 flex items-center gap-3">
        <FaPodcast className="text-orange-600" />
        My Podcasts
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search podcasts by topic or outline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-600 mb-4" />
          <p className="text-gray-600">Loading podcasts...</p>
        </div>
      )}

      {/* Podcasts List */}
      {!loading && (
        <>
          {filteredPodcasts.length === 0 ? (
            <div className="text-center py-12">
              <FaPodcast className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'No podcasts found matching your search.' : 'No saved podcasts yet.'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm ? 'Try a different search term.' : 'Generate and save a podcast to see it here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPodcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {podcast.topic || 'Untitled Podcast'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created: {formatDate(podcast.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {podcast.audioUrl && (
                        <button
                          onClick={() => handlePlayPause(podcast.id, podcast.audioUrl)}
                          className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-orange-700 flex items-center gap-2"
                          title={playingId === podcast.id ? 'Pause' : 'Play'}
                        >
                          {playingId === podcast.id ? <FaPause /> : <FaPlay />}
                        </button>
                      )}
                      <div className="relative group">
                        <button
                          className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-teal-700 flex items-center gap-2"
                          title="Download options"
                        >
                          <FaDownload />
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button
                            onClick={() => handleDownload(podcast, 'text')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Download Text
                          </button>
                          <button
                            onClick={() => handleDownload(podcast, 'json')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Download JSON
                          </button>
                          {podcast.audioUrl && (
                            <button
                              onClick={() => handleDownload(podcast, 'audio')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              Download Audio
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(podcast.id)}
                        className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-red-700 flex items-center gap-2"
                        title="Delete podcast"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Outline Preview */}
                  {podcast.outline && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Outline:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {podcast.outline}
                      </p>
                    </div>
                  )}

                  {/* Expandable Script Preview */}
                  {podcast.script && (
                    <details className="mt-3">
                      <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-teal-600">
                        View Full Script
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {podcast.script}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!searchTerm && totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => fetchPodcasts('prev')}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchPodcasts('next')}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

