/**
 * Chatbot RAG Retriever
 * 
 * Retrieves relevant knowledge base documents using semantic search
 * Similar to WriteupRetriever but uses vector embeddings for semantic similarity
 */

const admin = require('firebase-admin');
const { generateEmbedding, cosineSimilarity } = require('./embeddingsHelper');

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
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
   * @returns {Promise<Array>} Array of relevant documents with similarity scores
   */
  async retrieveRelevantDocuments(query, keys, topK = 3, categories = null) {
    try {
      console.log(`[ChatbotRAG] Retrieving documents for query: "${query.substring(0, 100)}..."`);

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

      // Calculate similarity for each document
      const documentsWithScores = [];
      
      for (const doc of snapshot.docs) {
        const docData = doc.data();
        
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

      // Sort by similarity (descending) and return top K
      documentsWithScores.sort((a, b) => b.similarity - a.similarity);
      
      // Filter by minimum similarity threshold (0.3 is a reasonable threshold)
      const MIN_SIMILARITY_THRESHOLD = 0.3;
      const filteredDocuments = documentsWithScores.filter(doc => doc.similarity >= MIN_SIMILARITY_THRESHOLD);
      const topDocuments = filteredDocuments.slice(0, topK);

      console.log(`[ChatbotRAG] Retrieved ${topDocuments.length} relevant documents (from ${documentsWithScores.length} total, threshold: ${MIN_SIMILARITY_THRESHOLD})`);
      if (topDocuments.length > 0) {
        console.log(`[ChatbotRAG] Top match: "${topDocuments[0].title}" (similarity: ${topDocuments[0].similarity.toFixed(3)})`);
        topDocuments.forEach((doc, idx) => {
          console.log(`[ChatbotRAG]   ${idx + 1}. "${doc.title}" - similarity: ${doc.similarity.toFixed(3)}`);
        });
      } else {
        console.warn(`[ChatbotRAG] No documents met similarity threshold of ${MIN_SIMILARITY_THRESHOLD}. Highest similarity: ${documentsWithScores.length > 0 ? documentsWithScores[0].similarity.toFixed(3) : 'N/A'}`);
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
  buildContextString(documents, maxLength = 3000) {
    if (!documents || documents.length === 0) {
      return '';
    }

    let context = '=== RELEVANT KNOWLEDGE BASE INFORMATION (PRIORITY SOURCE) ===\n\n';
    let currentLength = context.length;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const similarityNote = `[Similarity: ${(doc.similarity * 100).toFixed(1)}%]`;
      const docText = `Document ${i + 1}: ${doc.title} ${similarityNote}\n${doc.content}\nSource: ${doc.sourceUrl || doc.source || 'Internal Knowledge Base'}\n\n`;
      
      if (currentLength + docText.length > maxLength) {
        // Truncate content if needed
        const remainingLength = maxLength - currentLength - 50; // Leave room for truncation marker
        if (remainingLength > 0) {
          context += `Document ${i + 1}: ${doc.title} ${similarityNote}\n${doc.content.substring(0, remainingLength)}...\nSource: ${doc.sourceUrl || doc.source || 'Internal Knowledge Base'}\n\n`;
        }
        break;
      }
      
      context += docText;
      currentLength += docText.length;
    }

    context += '=== END KNOWLEDGE BASE INFORMATION ===\n\n';
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
      let batch = db.batch();
      let batchCount = 0;

      console.log(`[ChatbotRAG] Found ${snapshot.docs.length} documents in knowledge base`);

      for (const doc of snapshot.docs) {
        const docData = doc.data();
        
        // Skip if embedding already exists (unless forcing regeneration)
        if (!forceRegenerate && docData.embedding && Array.isArray(docData.embedding) && docData.embedding.length > 0) {
          skipped++;
          continue;
        }

        // Validate required fields
        if (!docData.title || !docData.content) {
          console.warn(`[ChatbotRAG] Skipping ${doc.id} - missing title or content`);
          errors++;
          continue;
        }

        try {
          const text = `${docData.title}\n${docData.content}`.substring(0, 8000);
          if (!text || text.trim().length === 0) {
            console.warn(`[ChatbotRAG] Skipping ${doc.id} - empty text`);
            errors++;
            continue;
          }

          console.log(`[ChatbotRAG] Generating embedding for ${doc.id}: "${docData.title}"`);
          const embedding = await generateEmbedding(text, keys);
          
          if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            console.error(`[ChatbotRAG] Invalid embedding returned for ${doc.id}`);
            errors++;
            continue;
          }
          
          batch.update(doc.ref, {
            embedding: embedding,
            embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          batchCount++;
          processed++;

          // Commit batch every batchSize documents
          if (batchCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
            console.log(`[ChatbotRAG] Processed ${processed} documents (skipped: ${skipped}, errors: ${errors})...`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`[ChatbotRAG] Error processing ${doc.id}:`, error.message, error.stack);
          errors++;
        }
      }

      // Commit remaining batch
      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`[ChatbotRAG] Generated embeddings for ${processed} documents (skipped: ${skipped}, errors: ${errors})`);
      return processed;

    } catch (error) {
      console.error('[ChatbotRAG] Error generating embeddings:', error);
      throw error;
    }
  }
}

module.exports = { ChatbotRAGRetriever };

