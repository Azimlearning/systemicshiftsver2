/**
 * Embeddings Helper
 * 
 * Generates vector embeddings for text using OpenAI or similar API
 * Used for semantic search in RAG implementation
 */

const fetch = (async () => {
  try {
    return (await import('node-fetch')).default;
  } catch {
    return require('node-fetch');
  }
})();

// OpenAI Embeddings API endpoint
const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
// Alternative: Use OpenRouter for embeddings
const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';

/**
 * Generate embedding for a text using OpenAI or OpenRouter
 * @param {string} text - Text to generate embedding for
 * @param {object} keys - Object containing API keys { openai, openrouter }
 * @param {string} model - Model to use (default: text-embedding-3-small)
 * @returns {Promise<number[]>} Vector embedding array
 */
async function generateEmbedding(text, keys, model = 'text-embedding-3-small') {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Text is required and must be non-empty');
  }

  // Try OpenAI first if key is available
  if (keys.openai) {
    try {
      return await generateOpenAIEmbedding(text, keys.openai, model);
    } catch (error) {
      console.warn('[Embeddings] OpenAI embedding failed, trying OpenRouter:', error.message);
    }
  }

  // Fallback to OpenRouter
  if (keys.openrouter) {
    try {
      return await generateOpenRouterEmbedding(text, keys.openrouter, model);
    } catch (error) {
      console.error('[Embeddings] OpenRouter embedding failed:', error.message);
      throw error;
    }
  }

  throw new Error('No embedding API key available (OpenAI or OpenRouter)');
}

/**
 * Generate embedding using OpenAI API
 */
async function generateOpenAIEmbedding(text, apiKey, model) {
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI embedding error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Invalid response format from OpenAI');
  }

  return data.data[0].embedding;
}

/**
 * Generate embedding using OpenRouter API
 */
async function generateOpenRouterEmbedding(text, apiKey, model) {
  // OpenRouter uses OpenAI-compatible endpoint
  const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
      'X-Title': 'Systemic Shift AI Embeddings',
    },
    body: JSON.stringify({
      model: model,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter embedding error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Invalid response format from OpenRouter');
  }

  return data.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Similarity score between -1 and 1
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to embed
 * @param {object} keys - API keys
 * @param {number} batchSize - Number of texts to process at once (default: 10)
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
async function generateEmbeddingsBatch(texts, keys, batchSize = 10) {
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => generateEmbedding(text, keys));
    const batchEmbeddings = await Promise.all(batchPromises);
    embeddings.push(...batchEmbeddings);
    
    // Small delay to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  cosineSimilarity,
};

