'use client';

import { useState, useEffect } from 'react';
import { FaPodcast, FaDownload, FaSpinner, FaPlay, FaPause, FaSave, FaCheck } from 'react-icons/fa';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PodcastGenerator() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [podcast, setPodcast] = useState(null);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPodcastId, setSavedPodcastId] = useState(null);

  const generatePodcastUrl = 'https://generatepodcast-el2jwxb5bq-uc.a.run.app'; // Will be updated after deployment

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a podcast topic.');
      return;
    }

    setGenerating(true);
    setProgress('Generating podcast outline...');
    setError('');
    setPodcast(null);
    // Clean up previous audio element
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      setAudioElement(null);
    }
    setAudioUrl(null);
    setPlaying(false);
    setSaved(false);
    setSavedPodcastId(null);

    try {
      const response = await fetch(generatePodcastUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          context: context.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate podcast' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      setProgress('Generating podcast script...');
      const data = await response.json();

      if (data.success && data.podcast) {
        setPodcast(data.podcast);
        setProgress('Podcast generated successfully!');
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl);
          // Create audio element for playback
          const audio = new Audio(data.audioUrl);
          audio.addEventListener('ended', () => setPlaying(false));
          audio.addEventListener('pause', () => setPlaying(false));
          audio.addEventListener('play', () => setPlaying(true));
          setAudioElement(audio);
        }
      } else {
        throw new Error(data.error || 'Failed to generate podcast');
      }
    } catch (err) {
      console.error('Error generating podcast:', err);
      setError(err.message || 'Failed to generate podcast. Please try again.');
      setProgress('');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadScript = () => {
    if (!podcast) return;

    const scriptText = JSON.stringify(podcast, null, 2);
    const blob = new Blob([scriptText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-${topic.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = () => {
    if (!podcast) return;

    let text = `Podcast: ${topic}\n\n`;
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
    a.download = `podcast-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `podcast-${topic.replace(/\s+/g, '-').toLowerCase()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSavePodcast = async () => {
    if (!podcast || !topic.trim()) {
      setError('No podcast to save.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Get user identifier from sessionStorage or use anonymous
      const userId = typeof window !== 'undefined' 
        ? (sessionStorage.getItem('isLoggedIn') === 'true' ? 'authenticated' : 'anonymous')
        : 'anonymous';

      const podcastData = {
        topic: topic.trim(),
        context: context.trim() || '',
        outline: podcast.outline || '',
        script: podcast.script || '',
        sections: podcast.sections || [],
        audioUrl: audioUrl || '',
        createdAt: serverTimestamp(),
        userId: userId
      };

      const docRef = await addDoc(collection(db, 'podcasts'), podcastData);
      setSavedPodcastId(docRef.id);
      setSaved(true);
      console.log('Podcast saved with ID:', docRef.id);
    } catch (err) {
      console.error('Error saving podcast:', err);
      setError('Failed to save podcast. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2 flex items-center gap-3">
        <FaPodcast className="text-orange-600" />
        AI Podcast Generator
      </h2>

      <div className="max-w-4xl mx-auto">
        {/* Input Form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="mb-4">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Podcast Topic <span className="text-red-500">*</span>
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Systemic Shift #8: Operate it Right"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={generating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a topic related to Systemic Shifts, PETRONAS Upstream, or related subjects.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide additional context, URLs, or specific points to cover..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={generating}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaPodcast />
                Generate Podcast
              </>
            )}
          </button>

          {progress && (
            <p className="mt-4 text-sm text-teal-600 text-center">{progress}</p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>

        {/* Generated Podcast Display */}
        {podcast && (
          <div className="bg-white border-2 border-teal-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Generated Podcast</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSavePodcast}
                  disabled={saving || saved}
                  className={`font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                    saved
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                  title={saved ? 'Podcast saved!' : 'Save podcast to your library'}
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <FaCheck />
                      Saved
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadText}
                  className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-teal-700 flex items-center gap-2"
                  title="Download as text"
                >
                  <FaDownload />
                  Text
                </button>
                <button
                  onClick={handleDownloadScript}
                  className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-gray-700 flex items-center gap-2"
                  title="Download as JSON"
                >
                  <FaDownload />
                  JSON
                </button>
                {audioUrl && audioElement && (
                  <>
                    <button
                      onClick={() => {
                        if (playing) {
                          audioElement.pause();
                        } else {
                          audioElement.play();
                        }
                      }}
                      className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-orange-700 flex items-center gap-2"
                    >
                      {playing ? <FaPause /> : <FaPlay />}
                      {playing ? 'Pause' : 'Play'}
                    </button>
                    <button
                      onClick={handleDownloadAudio}
                      className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-purple-700 flex items-center gap-2"
                      title="Download audio"
                    >
                      <FaDownload />
                      Audio
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Outline */}
            {podcast.outline && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Outline</h4>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800">
                  {podcast.outline}
                </div>
              </div>
            )}

            {/* Script */}
            {podcast.script && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Full Script</h4>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 max-h-96 overflow-y-auto">
                  {podcast.script}
                </div>
              </div>
            )}

            {/* Sections */}
            {podcast.sections && podcast.sections.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Sections</h4>
                <div className="space-y-4">
                  {podcast.sections.map((section, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        Section {idx + 1}: {section.title || 'Untitled'}
                      </h5>
                      {section.content && (
                        <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                      )}
                      {section.qa && section.qa.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {section.qa.map((qa, qaIdx) => (
                            <div key={qaIdx} className="bg-gray-50 p-3 rounded">
                              <p className="font-medium text-gray-800">Q: {qa.question}</p>
                              <p className="text-gray-700 mt-1">A: {qa.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

