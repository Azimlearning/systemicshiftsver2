// functions/podcastTTS.js

const textToSpeech = require('@google-cloud/text-to-speech');
const { getStorage } = require('firebase-admin/storage');

// Initialize TTS client
// In Cloud Functions, this will use Application Default Credentials automatically
let ttsClient;
try {
  ttsClient = new textToSpeech.TextToSpeechClient();
  console.log('[podcastTTS] TTS client initialized successfully');
} catch (error) {
  console.error('[podcastTTS] Failed to initialize TTS client:', error);
  throw error;
}

// Voice configuration
// Try WaveNet first (premium), fallback to Standard (free tier)
const HOST_VOICE = {
  name: 'en-US-Wavenet-F', // Female voice for host (WaveNet for better quality)
  languageCode: 'en-US',
  ssmlGender: 'FEMALE'
};

const GUEST_VOICE = {
  name: 'en-US-Wavenet-D', // Male voice for guest (WaveNet for better quality)
  languageCode: 'en-US',
  ssmlGender: 'MALE'
};

// Fallback voices (Standard - free tier)
const HOST_VOICE_FALLBACK = {
  name: 'en-US-Standard-F',
  languageCode: 'en-US',
  ssmlGender: 'FEMALE'
};

const GUEST_VOICE_FALLBACK = {
  name: 'en-US-Standard-D',
  languageCode: 'en-US',
  ssmlGender: 'MALE'
};

/**
 * Splits podcast script into segments by speaker (HOST: and GUEST: markers)
 * @param {string} script - The full podcast script
 * @returns {Array<{speaker: string, text: string}>} Array of speaker segments
 */
function splitScriptBySpeaker(script) {
  const segments = [];
  const lines = script.split('\n');
  let currentSpeaker = null;
  let currentText = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line starts with HOST: or GUEST: (case-insensitive, with or without colon)
    const hostMatch = trimmedLine.match(/^HOST\s*:?\s*/i);
    const guestMatch = trimmedLine.match(/^GUEST\s*:?\s*/i);
    
    if (hostMatch) {
      // Save previous segment if exists
      if (currentSpeaker && currentText.length > 0) {
        segments.push({
          speaker: currentSpeaker,
          text: currentText.join(' ').trim()
        });
      }
      // Start new segment
      currentSpeaker = 'HOST';
      currentText = [trimmedLine.replace(/^HOST\s*:?\s*/i, '').trim()];
    } else if (guestMatch) {
      // Save previous segment if exists
      if (currentSpeaker && currentText.length > 0) {
        segments.push({
          speaker: currentSpeaker,
          text: currentText.join(' ').trim()
        });
      }
      // Start new segment
      currentSpeaker = 'GUEST';
      currentText = [trimmedLine.replace(/^GUEST\s*:?\s*/i, '').trim()];
    } else if (currentSpeaker && trimmedLine.length > 0) {
      // Continue current segment (skip empty lines)
      currentText.push(trimmedLine);
    }
  }

  // Add final segment
  if (currentSpeaker && currentText.length > 0) {
    segments.push({
      speaker: currentSpeaker,
      text: currentText.join(' ').trim()
    });
  }

  // If no segments found, try to parse as a single continuous script
  // and assign to HOST as default
  if (segments.length === 0 && script.trim().length > 0) {
    console.log('[podcastTTS] No HOST:/GUEST: markers found, treating entire script as HOST');
    segments.push({
      speaker: 'HOST',
      text: script.trim()
    });
  }

  return segments;
}

/**
 * Generates audio for a single text segment using Google Cloud TTS
 * @param {string} text - Text to convert to speech
 * @param {Object} voiceConfig - Voice configuration object
 * @returns {Promise<Buffer>} Audio buffer
 */
async function generateAudioSegment(text, voiceConfig, fallbackVoiceConfig = null) {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Split long text into chunks (TTS has ~5000 character limit)
  const maxChunkLength = 4500; // Leave some buffer
  const chunks = [];
  
  if (text.length <= maxChunkLength) {
    chunks.push(text);
  } else {
    // Split by sentences to avoid cutting mid-sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        // If single sentence is too long, split it
        if (sentence.length > maxChunkLength) {
          const words = sentence.split(' ');
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + word + ' ').length <= maxChunkLength) {
              wordChunk += word + ' ';
            } else {
              if (wordChunk) chunks.push(wordChunk.trim());
              wordChunk = word + ' ';
            }
          }
          if (wordChunk) currentChunk = wordChunk;
        } else {
          currentChunk = sentence;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);
  }

  // Generate audio for each chunk and concatenate
  const audioBuffers = [];
  for (const chunk of chunks) {
    const request = {
      input: { text: chunk },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    try {
      console.log(`[podcastTTS] Calling TTS API for chunk (${chunk.length} chars) with voice: ${voiceConfig.name}...`);
      const [response] = await ttsClient.synthesizeSpeech(request);
      if (response.audioContent) {
        const audioBuffer = Buffer.from(response.audioContent, 'base64');
        console.log(`[podcastTTS] Generated audio chunk: ${audioBuffer.length} bytes`);
        audioBuffers.push(audioBuffer);
      } else {
        console.warn(`[podcastTTS] No audioContent in TTS response`);
      }
    } catch (error) {
      console.error(`[podcastTTS] Error generating audio for chunk with voice ${voiceConfig.name}:`, error);
      console.error(`[podcastTTS] Error details:`, {
        message: error.message,
        code: error.code,
        details: error.details
      });
      
      // Try fallback voice if available
      if (fallbackVoiceConfig && error.code === 3) { // INVALID_ARGUMENT
        console.log(`[podcastTTS] Trying fallback voice: ${fallbackVoiceConfig.name}`);
        try {
          const fallbackRequest = {
            ...request,
            voice: fallbackVoiceConfig
          };
          const [fallbackResponse] = await ttsClient.synthesizeSpeech(fallbackRequest);
          if (fallbackResponse.audioContent) {
            const audioBuffer = Buffer.from(fallbackResponse.audioContent, 'base64');
            console.log(`[podcastTTS] Generated audio chunk with fallback voice: ${audioBuffer.length} bytes`);
            audioBuffers.push(audioBuffer);
          } else {
            throw error; // Re-throw original error if fallback also fails
          }
        } catch (fallbackError) {
          console.error(`[podcastTTS] Fallback voice also failed:`, fallbackError);
          throw error; // Re-throw original error
        }
      } else {
        throw error;
      }
    }
  }

  // Concatenate all audio buffers
  if (audioBuffers.length === 0) {
    return null;
  }
  
  return Buffer.concat(audioBuffers);
}

/**
 * Concatenates multiple MP3 audio buffers into a single buffer
 * Note: This is a simple concatenation. For production, consider using ffmpeg for proper MP3 merging
 * @param {Array<Buffer>} audioBuffers - Array of MP3 audio buffers
 * @returns {Buffer} Concatenated audio buffer
 */
function concatenateAudioBuffers(audioBuffers) {
  // Simple concatenation - works for MP3 files from same source
  // For production, consider using a proper MP3 concatenation library
  return Buffer.concat(audioBuffers);
}

/**
 * Generates complete podcast audio from script
 * @param {string} script - The full podcast script with HOST: and GUEST: markers
 * @param {string} topic - Podcast topic (for filename)
 * @returns {Promise<string>} Public URL of uploaded audio file
 */
async function generatePodcastAudio(script, topic) {
  console.log('[podcastTTS] Starting audio generation...');
  console.log(`[podcastTTS] Script length: ${script.length} characters`);
  console.log(`[podcastTTS] Script preview (first 500 chars): ${script.substring(0, 500)}`);
  
  // Split script into speaker segments
  const segments = splitScriptBySpeaker(script);
  console.log(`[podcastTTS] Split script into ${segments.length} segments`);
  
  if (segments.length > 0) {
    console.log(`[podcastTTS] First segment preview: ${JSON.stringify(segments[0]).substring(0, 200)}`);
  }

  if (segments.length === 0) {
    console.error('[podcastTTS] No speaker segments found. Script format may not match expected HOST:/GUEST: markers.');
    console.error('[podcastTTS] Script sample:', script.substring(0, 1000));
    throw new Error('No speaker segments found in script. Expected format: HOST: ... GUEST: ...');
  }

  // Generate audio for each segment
  const audioBuffers = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const voiceConfig = segment.speaker === 'HOST' ? HOST_VOICE : GUEST_VOICE;
    const fallbackVoiceConfig = segment.speaker === 'HOST' ? HOST_VOICE_FALLBACK : GUEST_VOICE_FALLBACK;
    
    console.log(`[podcastTTS] Generating audio for segment ${i + 1}/${segments.length} (${segment.speaker})`);
    
    try {
      console.log(`[podcastTTS] Segment ${i + 1} text length: ${segment.text.length} chars`);
      const audioBuffer = await generateAudioSegment(segment.text, voiceConfig, fallbackVoiceConfig);
      if (audioBuffer) {
        console.log(`[podcastTTS] Segment ${i + 1} audio generated: ${audioBuffer.length} bytes`);
        audioBuffers.push(audioBuffer);
      } else {
        console.warn(`[podcastTTS] Segment ${i + 1} returned null audio buffer`);
      }
    } catch (error) {
      console.error(`[podcastTTS] Error generating audio for segment ${i + 1}:`, error);
      console.error(`[podcastTTS] Error stack:`, error.stack);
      // Re-throw to fail fast and see the actual error
      throw new Error(`Failed to generate audio for segment ${i + 1} (${segment.speaker}): ${error.message}`);
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error('Failed to generate any audio segments');
  }

  // Concatenate all audio segments
  console.log('[podcastTTS] Concatenating audio segments...');
  const finalAudioBuffer = concatenateAudioBuffers(audioBuffers);

  // Upload to Firebase Storage
  console.log('[podcastTTS] Uploading audio to Firebase Storage...');
  console.log(`[podcastTTS] Final audio buffer size: ${finalAudioBuffer.length} bytes`);
  
  try {
    const storage = getStorage();
    const bucket = storage.bucket('systemicshiftv2.firebasestorage.app');
    
    // Generate filename
    const timestamp = Date.now();
    const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50);
    const filename = `podcasts/${safeTopic}-${timestamp}.mp3`;
    
    console.log(`[podcastTTS] Uploading to: ${filename}`);
    const file = bucket.file(filename);
    
    await file.save(finalAudioBuffer, {
      contentType: 'audio/mpeg',
      metadata: {
        metadata: {
          topic: topic,
          generatedAt: new Date().toISOString()
        }
      }
    });
    console.log('[podcastTTS] File saved to Storage');
    
    // Make file public
    await file.makePublic();
    console.log('[podcastTTS] File made public');
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(filename)}`;
    console.log(`[podcastTTS] Audio uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (storageError) {
    console.error('[podcastTTS] Storage upload error:', storageError);
    console.error('[podcastTTS] Storage error details:', {
      message: storageError.message,
      code: storageError.code,
      stack: storageError.stack
    });
    throw new Error(`Failed to upload audio to Storage: ${storageError.message}`);
  }
}

module.exports = {
  generatePodcastAudio,
  splitScriptBySpeaker,
  generateAudioSegment
};

