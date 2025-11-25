/**
 * Inject Knowledge Base Entry
 * 
 * Cloud Function to add a single knowledge base entry manually
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { generateEmbedding } = require('./embeddingsHelper');

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
}

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_TEXT_LIMIT = 8000; // stay within embedding token limits
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 20000;
const MAX_TAG_LENGTH = 50;
const ALLOWED_CATEGORIES = new Set([
  'systemic-shifts',
  'mindset-behaviour',
  'upstream-target',
  'petronas-info',
  'upstream',
  'articles',
  'general'
]);
const CATEGORY_KEYWORDS = {
  'systemic-shifts': ['systemic shift', 'shift #', 'portfolio high-grading', 'advantaged barrels'],
  'mindset-behaviour': ['mindset', 'behaviour', 'behavior', 'culture', 'ways of working'],
  'upstream-target': ['production', 'barrels', 'reservoir', 'well', 'field development'],
  'petronas-info': ['petronas', 'lng', 'gas', 'corporate'],
  'upstream': ['upstream', 'subsurface', 'platform', 'facility'],
  'articles': ['article', 'story', 'publication', 'write-up'],
};

function sanitizeContent(text = '') {
  return text.replace(/<script.*?>.*?<\/script>/gim, '')
    .replace(/[\u0000-\u001F]+/g, ' ')
    .trim();
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
}

function inferCategory(title, content, providedCategory) {
  if (providedCategory && providedCategory !== 'general') {
    return providedCategory;
  }
  const combined = `${title} ${content}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => combined.includes(keyword))) {
      return category;
    }
  }
  return providedCategory || 'general';
}

function scoreContentQuality(text) {
  const lengthScore = Math.min(text.length / 800, 1);
  const structureScore = /\n\n|\d\./.test(text) ? 1 : 0.6;
  const dataScore = /\d/.test(text) ? 1 : 0.5;
  const score = Number(((lengthScore + structureScore + dataScore) / 3).toFixed(2));
  return {
    score,
    details: {
      lengthScore: Number(lengthScore.toFixed(2)),
      structureScore,
      dataScore
    }
  };
}

function buildEmbeddingKeys() {
  const keys = {};
  if (process.env.OPENAI_API_KEY) {
    keys.openai = process.env.OPENAI_API_KEY;
  }
  if (process.env.OPENROUTER_API_KEY) {
    keys.openrouter = process.env.OPENROUTER_API_KEY;
  }
  return keys;
}

async function generateDocumentEmbedding(title, content) {
  const keys = buildEmbeddingKeys();
  if (!keys.openai && !keys.openrouter) {
    console.warn('[Inject Knowledge Base] Embedding skipped — no API keys configured');
    return { status: 'skipped', reason: 'missing_api_keys' };
  }

  const text = `${title}\n${content}`.substring(0, EMBEDDING_TEXT_LIMIT);
  const embedding = await generateEmbedding(text, keys, EMBEDDING_MODEL);
  return {
    status: 'ready',
    embedding,
    embeddingModel: EMBEDDING_MODEL,
  };
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

      const trimmedTitle = sanitizeContent(title).substring(0, MAX_TITLE_LENGTH);
      const trimmedContentRaw = sanitizeContent(content);
      if (trimmedContentRaw.length > MAX_CONTENT_LENGTH) {
        return res.status(400).send({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters.` });
      }

      const normalizedCategory = category.trim().toLowerCase();
      if (!ALLOWED_CATEGORIES.has(normalizedCategory)) {
        return res.status(400).send({ error: `Category "${category}" is not allowed.` });
      }

      if (sourceUrl && !isValidUrl(sourceUrl)) {
        return res.status(400).send({ error: 'sourceUrl must be a valid HTTP/HTTPS URL.' });
      }

      // Validate tags array
      const tagsArray = Array.isArray(tags) 
        ? tags
            .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
            .map(tag => tag.trim().substring(0, MAX_TAG_LENGTH))
        : [];

      const trimmedContent = trimmedContentRaw;
      const autoCategory = inferCategory(trimmedTitle, trimmedContent, normalizedCategory);

      const db = getDb();
      const duplicateSnap = await db.collection('knowledgeBase')
        .where('titleLower', '==', trimmedTitle.toLowerCase())
        .limit(1)
        .get();
      if (!duplicateSnap.empty) {
        return res.status(409).send({ error: 'A knowledge base entry with this title already exists.' });
      }

      // Create document
      const knowledgeDoc = {
        title: trimmedTitle,
        content: trimmedContent,
        category: autoCategory,
        titleLower: trimmedTitle.toLowerCase(),
        tags: tagsArray,
        source: source || 'manual',
        sourceUrl: sourceUrl ? sourceUrl.trim() : '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        embeddingStatus: 'pending',
        contentQuality: scoreContentQuality(trimmedContent)
      };

      try {
        const embeddingResult = await generateDocumentEmbedding(trimmedTitle, trimmedContent);
        knowledgeDoc.embeddingStatus = embeddingResult.status;
        if (embeddingResult.status === 'ready') {
          knowledgeDoc.embedding = embeddingResult.embedding;
          knowledgeDoc.embeddingModel = embeddingResult.embeddingModel;
          knowledgeDoc.embeddingGeneratedAt = admin.firestore.FieldValue.serverTimestamp();
        } else if (embeddingResult.reason) {
          knowledgeDoc.embeddingStatusReason = embeddingResult.reason;
        }
      } catch (embeddingError) {
        console.error('[Inject Knowledge Base] Embedding generation failed:', embeddingError);
        knowledgeDoc.embeddingStatus = 'error';
        knowledgeDoc.embeddingStatusReason = embeddingError.message?.substring(0, 200) || 'unknown_error';
      }

      // Add to Firestore
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

