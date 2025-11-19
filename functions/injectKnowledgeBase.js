/**
 * Inject Knowledge Base Entry
 * 
 * Cloud Function to add a single knowledge base entry manually
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
}

/**
 * Cloud Function to inject a single knowledge base entry
 */
exports.injectKnowledgeBase = async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    try {
      const { title, content, category, tags, source, sourceUrl } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).send({ error: 'Title is required and must be a non-empty string' });
      }

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).send({ error: 'Content is required and must be a non-empty string' });
      }

      if (!category || typeof category !== 'string') {
        return res.status(400).send({ error: 'Category is required' });
      }

      // Validate tags array
      const tagsArray = Array.isArray(tags) 
        ? tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        : [];

      // Create document
      const knowledgeDoc = {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        tags: tagsArray,
        source: source || 'manual',
        sourceUrl: sourceUrl ? sourceUrl.trim() : '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Add to Firestore
      const db = getDb();
      const docRef = await db.collection('knowledgeBase').add(knowledgeDoc);

      console.log(`[Inject Knowledge Base] Added document: ${docRef.id} - "${title}"`);

      res.status(200).send({
        success: true,
        message: 'Knowledge base entry added successfully',
        documentId: docRef.id,
        data: knowledgeDoc,
      });

    } catch (error) {
      console.error('[Inject Knowledge Base] Error:', error);
      res.status(500).send({
        success: false,
        error: error.message || 'Failed to add knowledge base entry',
      });
    }
  });
};

