/**
 * Generate Embeddings for Knowledge Base
 * 
 * Cloud Function to generate and store embeddings for all knowledge base documents
 * This should be run once after populating the knowledge base, or periodically to update embeddings
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { defineSecret } = require('firebase-functions/params');
const { ChatbotRAGRetriever } = require('./chatbotRAGRetriever');

// Use existing Firebase Admin instance (initialized in index.js)

// Secrets
const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');

/**
 * Cloud Function to generate embeddings for all knowledge base documents
 */
exports.generateEmbeddings = require('firebase-functions/v2/https').onRequest(
  {
    region: 'us-central1',
    secrets: [openRouterApiKey],
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).send({ error: 'Method Not Allowed' });
      }

      try {
        const keys = {
          openrouter: openRouterApiKey.value()
        };

        const ragRetriever = new ChatbotRAGRetriever();
        const processed = await ragRetriever.generateAllEmbeddings(keys, 10);

        res.status(200).send({
          success: true,
          message: `Successfully generated embeddings for ${processed} documents`,
          processed: processed,
        });

      } catch (error) {
        console.error('[Generate Embeddings] Error:', error);
        res.status(500).send({
          success: false,
          error: error.message || 'Failed to generate embeddings',
        });
      }
    });
  }
);

