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
      const topDocuments = documentsWithScores.slice(0, topK);

      console.log(`[ChatbotRAG] Retrieved ${topDocuments.length} relevant documents`);
      if (topDocuments.length > 0) {
        console.log(`[ChatbotRAG] Top match: "${topDocuments[0].title}" (similarity: ${topDocuments[0].similarity.toFixed(3)})`);
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

    let context = 'Relevant Knowledge Base Information:\n\n';
    let currentLength = context.length;

    for (const doc of documents) {
      const docText = `[${doc.title}]\n${doc.content}\nSource: ${doc.sourceUrl || doc.source}\n\n`;
      
      if (currentLength + docText.length > maxLength) {
        // Truncate content if needed
        const remainingLength = maxLength - currentLength - 50; // Leave room for truncation marker
        if (remainingLength > 0) {
          context += `[${doc.title}]\n${doc.content.substring(0, remainingLength)}...\nSource: ${doc.sourceUrl || doc.source}\n\n`;
        }
        break;
      }
      
      context += docText;
      currentLength += docText.length;
    }

    return context.trim();
  }

  /**
   * Generate embeddings for all documents in knowledge base (batch operation)
   * @param {object} keys - API keys
   * @param {number} batchSize - Number of documents to process at once
   * @returns {Promise<number>} Number of documents processed
   */
  async generateAllEmbeddings(keys, batchSize = 10) {
    try {
      const db = getDb();
      const snapshot = await db.collection('knowledgeBase').get();
      let processed = 0;
      let batch = db.batch();
      let batchCount = 0;

      for (const doc of snapshot.docs) {
        const docData = doc.data();
        
        // Skip if embedding already exists and is recent
        if (docData.embedding && Array.isArray(docData.embedding) && docData.embedding.length > 0) {
          console.log(`[ChatbotRAG] Skipping ${doc.id} - embedding already exists`);
          continue;
        }

        try {
          const text = `${docData.title}\n${docData.content}`.substring(0, 8000);
          const embedding = await generateEmbedding(text, keys);
          
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
            console.log(`[ChatbotRAG] Processed ${processed} documents...`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`[ChatbotRAG] Error processing ${doc.id}:`, error.message);
        }
      }

      // Commit remaining batch
      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`[ChatbotRAG] Generated embeddings for ${processed} documents`);
      return processed;

    } catch (error) {
      console.error('[ChatbotRAG] Error generating embeddings:', error);
      throw error;
    }
  }
}

module.exports = { ChatbotRAGRetriever };

