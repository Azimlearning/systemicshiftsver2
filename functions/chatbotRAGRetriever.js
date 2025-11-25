/**
 * Chatbot RAG Retriever
 * 
 * Retrieves relevant knowledge base documents using semantic search
 * Similar to WriteupRetriever but uses vector embeddings for semantic similarity
 */

const admin = require('firebase-admin');
const crypto = require('crypto');
const { generateEmbedding, cosineSimilarity } = require('./embeddingsHelper');

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
}

const DEFAULT_SIMILARITY_THRESHOLDS = {
  general: 0.3,
  chat: 0.28,
  podcast: 0.27,
  writeup: 0.32
};
const CACHE_COLLECTION = 'ragQueryCache';
const CACHE_TTL_MINUTES = 30;

function getAdaptiveSimilarityThreshold(query = '', queryType = 'general', override = null) {
  if (typeof override === 'number' && !Number.isNaN(override)) {
    return Math.min(Math.max(override, 0), 1);
  }

  const base = DEFAULT_SIMILARITY_THRESHOLDS[queryType] ?? DEFAULT_SIMILARITY_THRESHOLDS.general;
  const queryLength = query.length;

  if (queryLength < 80) {
    return Math.min(base + 0.07, 0.5);
  }

  if (queryLength > 300) {
    return Math.max(base - 0.07, 0.2);
  }

  return base;
}

class ChatbotRAGRetriever {
  constructor() {
    this.cache = new Map(); // Simple in-memory cache for embeddings
  }

  /**
   * Retrieve relevant documents from knowledge base using semantic search
   * @param {string} query - User's question/query
   * @param {object} keys - API keys for embeddings { openai, openrouter }
   * @param {number} topK - Number of documents to retrieve (default: 3)
   * @param {string[]} categories - Optional categories to filter by
   * @param {object} options - Optional configuration { minSimilarity, queryType, adaptive }
   * @returns {Promise<Array>} Array of relevant documents with similarity scores
   */
  async retrieveRelevantDocuments(query, keys, topK = 3, categories = null, options = {}) {
    try {
      console.log(`[ChatbotRAG] Retrieving documents for query: "${query.substring(0, 100)}..."`);

      const useCache = options.useCache !== false;
      const cacheKey = useCache ? this._buildCacheKey(query, categories, options.queryType) : null;
      if (useCache && cacheKey) {
        const cached = await this._getCachedDocuments(cacheKey);
        if (cached) {
          console.log('[ChatbotRAG] Cache hit for query');
          return cached;
        }
      }

      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query, keys);
      console.log(`[ChatbotRAG] Generated query embedding (${queryEmbedding.length} dimensions)`);

      // Build Firestore query
      const db = getDb();
      let knowledgeBaseQuery = db.collection('knowledgeBase');
      
      // Filter by categories if provided
      if (categories && categories.length > 0) {
        knowledgeBaseQuery = knowledgeBaseQuery.where('category', 'in', categories);
      }

      // Get all documents (or filtered subset)
      const snapshot = await knowledgeBaseQuery.get();
      
      if (snapshot.empty) {
        console.log('[ChatbotRAG] No documents found in knowledge base');
        return [];
      }

      console.log(`[ChatbotRAG] Found ${snapshot.size} documents to search`);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        data: doc.data()
      }));

      const docsMissingEmbeddings = documents.filter(doc => !doc.data.embedding || !Array.isArray(doc.data.embedding));
      if (docsMissingEmbeddings.length > 0) {
        console.log(`[ChatbotRAG] ${docsMissingEmbeddings.length} documents missing embeddings, generating in parallel...`);
        await this._populateMissingEmbeddings(docsMissingEmbeddings, keys);
      }

      // Calculate similarity for each document
      const documentsWithScores = [];
      
      for (const doc of documents) {
        const docData = doc.data;
        
        // Skip if no embedding exists
        if (!docData.embedding || !Array.isArray(docData.embedding)) {
          // Generate embedding on-the-fly if missing
          console.log(`[ChatbotRAG] Generating embedding for document: ${doc.id}`);
          try {
            const embedding = await generateEmbedding(
              `${docData.title}\n${docData.content}`.substring(0, 8000), // Limit text length
              keys
            );
            
            // Store embedding in Firestore for future use
            await doc.ref.update({ 
              embedding: embedding,
              embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            docData.embedding = embedding;
          } catch (error) {
            console.warn(`[ChatbotRAG] Failed to generate embedding for ${doc.id}:`, error.message);
            continue; // Skip this document
          }
        }

        // Calculate cosine similarity
        const similarity = cosineSimilarity(queryEmbedding, docData.embedding);
        
        documentsWithScores.push({
          id: doc.id,
          title: docData.title,
          content: docData.content,
          category: docData.category,
          source: docData.source,
          sourceUrl: docData.sourceUrl,
          tags: docData.tags || [],
          similarity: similarity,
        });
      }

      const similarityThreshold = getAdaptiveSimilarityThreshold(
        query,
        options.queryType,
        options.minSimilarity
      );
      console.log(`[ChatbotRAG] Similarity threshold resolved to ${similarityThreshold.toFixed(3)} (queryType=${options.queryType || 'general'})`);

      // Sort by similarity (descending) and return top K
      documentsWithScores.sort((a, b) => b.similarity - a.similarity);

      const filteredDocuments = documentsWithScores.filter(doc => doc.similarity >= similarityThreshold);
      const topDocuments = filteredDocuments.slice(0, topK);

      console.log(`[ChatbotRAG] Retrieved ${topDocuments.length} relevant documents (from ${documentsWithScores.length} total, threshold: ${similarityThreshold.toFixed(3)})`);
      if (topDocuments.length > 0) {
        console.log(`[ChatbotRAG] Top match: "${topDocuments[0].title}" (similarity: ${topDocuments[0].similarity.toFixed(3)})`);
        topDocuments.forEach((doc, idx) => {
          console.log(`[ChatbotRAG]   ${idx + 1}. "${doc.title}" - similarity: ${doc.similarity.toFixed(3)}`);
        });
      } else {
        console.warn(`[ChatbotRAG] No documents met similarity threshold of ${similarityThreshold.toFixed(3)}. Highest similarity: ${documentsWithScores.length > 0 ? documentsWithScores[0].similarity.toFixed(3) : 'N/A'}`);
      }

      if (useCache && cacheKey) {
        await this._setCachedDocuments(cacheKey, topDocuments);
      }

      return topDocuments;

    } catch (error) {
      console.error('[ChatbotRAG] Error retrieving documents:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Build context string from retrieved documents
   * @param {Array} documents - Array of retrieved documents
   * @param {number} maxLength - Maximum length of context string (default: 3000)
   * @returns {string} Formatted context string
   */
  buildContextString(documents, options = {}) {
    if (!documents || documents.length === 0) {
      return '';
    }

    const maxTokens = Math.max(options.maxTokens || 750, 200);
    const approxCharsPerToken = 4;

    let context = '=== RELEVANT KNOWLEDGE BASE INFORMATION (PRIORITY SOURCE) ===\n\n';
    let tokensUsed = Math.ceil(context.length / approxCharsPerToken);

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const similarityNote = doc.similarity != null
        ? `[Similarity: ${(doc.similarity * 100).toFixed(1)}%]`
        : '';
      const sourceText = doc.sourceUrl || doc.source || 'Internal Knowledge Base';
      const docHeader = `Document ${i + 1}: ${doc.title} ${similarityNote}\n`;
      const docFooter = `\nSource: ${sourceText}\n\n`;

      const headerTokens = Math.ceil(docHeader.length / approxCharsPerToken);
      const footerTokens = Math.ceil(docFooter.length / approxCharsPerToken);

      if (tokensUsed + headerTokens >= maxTokens) {
        break;
      }

      context += docHeader;
      tokensUsed += headerTokens;

      const remainingTokens = maxTokens - tokensUsed - footerTokens;
      if (remainingTokens <= 0) {
        context += '...[context truncated]\n';
        tokensUsed = maxTokens;
        break;
      }

      const maxDocChars = remainingTokens * approxCharsPerToken;
      const docContent = (doc.content || '').substring(0, maxDocChars);
      context += docContent;
      tokensUsed += Math.ceil(docContent.length / approxCharsPerToken);

      if (docContent.length < (doc.content || '').length) {
        context += '...\n';
        tokensUsed = maxTokens;
        context += docFooter;
        break;
      }

      context += docFooter;
      tokensUsed += footerTokens;
    }

    context += '=== END KNOWLEDGE BASE INFORMATION ===\n\n';
    console.log(`[ChatbotRAG] Context window built using ~${tokensUsed} tokens (limit ${maxTokens})`);
    return context.trim();
  }

  /**
   * Generate embeddings for all documents in knowledge base (batch operation)
   * @param {object} keys - API keys
   * @param {number} batchSize - Number of documents to process at once
   * @param {boolean} forceRegenerate - Force regeneration even if embedding exists
   * @returns {Promise<number>} Number of documents processed
   */
  async generateAllEmbeddings(keys, batchSize = 10, forceRegenerate = false) {
    try {
      const db = getDb();
      const snapshot = await db.collection('knowledgeBase').get();
      let processed = 0;
      let skipped = 0;
      let errors = 0;

      console.log(`[ChatbotRAG] Found ${snapshot.docs.length} documents in knowledge base`);
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, data: doc.data() }));
      const docsToProcess = documents.filter(doc => 
        forceRegenerate || !doc.data.embedding || !Array.isArray(doc.data.embedding) || doc.data.embedding.length === 0
      );
      skipped = documents.length - docsToProcess.length;

      for (let i = 0; i < docsToProcess.length; i += batchSize) {
        const chunk = docsToProcess.slice(i, i + batchSize);
        console.log(`[ChatbotRAG] Processing embedding chunk ${i / batchSize + 1}/${Math.ceil(docsToProcess.length / batchSize)}`);
        const chunkResults = await Promise.all(chunk.map(async doc => {
          const docData = doc.data;
          if (!docData.title || !docData.content) {
            console.warn(`[ChatbotRAG] Skipping ${doc.id} - missing title or content`);
            return { status: 'error' };
          }
          try {
            const text = `${docData.title}\n${docData.content}`.substring(0, 8000);
            if (!text.trim()) {
              console.warn(`[ChatbotRAG] Skipping ${doc.id} - empty text`);
              return { status: 'error' };
            }
            const embedding = await generateEmbedding(text, keys);
            if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
              console.error(`[ChatbotRAG] Invalid embedding returned for ${doc.id}`);
              return { status: 'error' };
            }
            docData.embedding = embedding;
            return { status: 'ok', doc };
          } catch (err) {
            console.error(`[ChatbotRAG] Error processing ${doc.id}:`, err.message);
            return { status: 'error' };
          }
        }));

        const batch = db.batch();
        chunkResults.forEach(result => {
          if (result.status === 'ok') {
            processed++;
            batch.update(result.doc.ref, {
              embedding: result.doc.data.embedding,
              embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            errors++;
          }
        });
        await batch.commit();
        console.log(`[ChatbotRAG] Processed ${processed} documents (skipped: ${skipped}, errors: ${errors})...`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`[ChatbotRAG] Generated embeddings for ${processed} documents (skipped: ${skipped}, errors: ${errors})`);
      return processed;

    } catch (error) {
      console.error('[ChatbotRAG] Error generating embeddings:', error);
      throw error;
    }
  }

  _buildCacheKey(query, categories, queryType) {
    const hash = crypto.createHash('sha1');
    hash.update(`${queryType || 'general'}|${query}|${(categories || []).join(',')}`);
    return hash.digest('hex');
  }

  async _getCachedDocuments(cacheKey) {
    try {
      const docRef = await getDb().collection(CACHE_COLLECTION).doc(cacheKey).get();
      if (!docRef.exists) {
        return null;
      }
      const data = docRef.data();
      if (!data || !data.expiresAt) {
        await docRef.ref.delete();
        return null;
      }
      const expiresAt = data.expiresAt.toDate();
      if (expiresAt < new Date()) {
        await docRef.ref.delete();
        return null;
      }
      return data.documents || null;
    } catch (err) {
      console.warn('[ChatbotRAG] Failed to read cache:', err.message);
      return null;
    }
  }

  async _setCachedDocuments(cacheKey, documents) {
    try {
      const expiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000)
      );
      await getDb().collection(CACHE_COLLECTION).doc(cacheKey).set({
        documents,
        expiresAt,
        cachedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn('[ChatbotRAG] Failed to write cache:', err.message);
    }
  }

  async _populateMissingEmbeddings(docWrappers, keys) {
    const chunkSize = 3;
    for (let i = 0; i < docWrappers.length; i += chunkSize) {
      const chunk = docWrappers.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async wrapper => {
        const docData = wrapper.data;
        try {
          const text = `${docData.title || ''}\n${docData.content || ''}`.substring(0, 8000);
          if (!text.trim()) {
            return;
          }
          const embedding = await generateEmbedding(text, keys);
          docData.embedding = embedding;
          await wrapper.ref.update({
            embedding,
            embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (err) {
          console.warn(`[ChatbotRAG] Failed to generate embedding for ${wrapper.id}: ${err.message}`);
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

module.exports = { ChatbotRAGRetriever };

