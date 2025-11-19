/**
 * Upload Knowledge Base Document
 * 
 * Cloud Function to upload a document, extract text, and optionally create knowledge base entry
 */

const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Lazy getters for Firebase services (initialized in index.js)
function getDb() {
  return admin.firestore();
}

function getStorage() {
  return admin.storage();
}

function getBucket() {
  return getStorage().bucket("systemicshiftv2.firebasestorage.app");
}

/**
 * Extract text from uploaded file
 */
async function extractTextFromFile(filePath, fileExt) {
  let extractedText = "";

  try {
    if (fileExt === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (fileExt === '.docx' || fileExt === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (fileExt === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    console.log(`[Upload Knowledge Base] Extracted ${extractedText.length} characters from ${fileExt} file`);
    return extractedText;
  } catch (error) {
    console.error(`[Upload Knowledge Base] Error extracting text from ${fileExt}:`, error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Cloud Function to upload document and extract text
 */
exports.uploadKnowledgeBase = async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    let formData = {};
    let filePath = null;
    let fileName = null;
    let fileMimeType = null;

    busboy.on('field', (fieldname, val) => {
      formData[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, filenameDetails) => {
      if (fieldname === 'file') {
        const { filename, mimeType } = filenameDetails;
        fileName = filename;
        fileMimeType = mimeType;
        filePath = path.join(tmpdir, filename);
        const writeStream = fs.createWriteStream(filePath);
        file.pipe(writeStream);

        file.on('end', () => writeStream.end());
      }
    });

    busboy.on('finish', async () => {
      try {
        if (!filePath || !fs.existsSync(filePath)) {
          return res.status(400).send({ error: 'No file uploaded' });
        }

        const fileExt = path.extname(fileName).toLowerCase();
        const allowedExt = ['.pdf', '.docx', '.doc', '.txt'];

        if (!allowedExt.includes(fileExt)) {
          fs.unlinkSync(filePath);
          return res.status(400).send({ 
            error: `File type ${fileExt} not supported. Allowed: ${allowedExt.join(', ')}` 
          });
        }

        // Extract text from file
        const extractedText = await extractTextFromFile(filePath, fileExt);

        // Upload file to Storage
        const bucket = getBucket();
        const uniqueFilename = `knowledgeBase/${Date.now()}_${fileName}`;
        const [uploadedFile] = await bucket.upload(filePath, {
          destination: uniqueFilename,
          metadata: { contentType: fileMimeType }
        });
        await uploadedFile.makePublic();
        const fileUrl = uploadedFile.publicUrl();

        // Clean up temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Generate suggested title from filename if not provided
        const suggestedTitle = formData.title || fileName.replace(/\.[^/.]+$/, '');

        // Simple tag suggestions from filename and category
        const suggestedTags = [];
        if (formData.category) {
          suggestedTags.push(formData.category);
        }
        // Add filename words as tags (remove extension, split by dash/underscore)
        const nameWords = fileName.replace(/\.[^/.]+$/, '').split(/[-_\s]+/);
        suggestedTags.push(...nameWords.filter(w => w.length > 2).slice(0, 3));

        // If addDirectly flag is set, create knowledge base entry immediately
        if (formData.addDirectly === 'true') {
          // Parse tags from form or use suggested tags
          let tagsArray = [];
          if (formData.tags) {
            tagsArray = formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
          }
          if (tagsArray.length === 0) {
            tagsArray = suggestedTags;
          }

          const knowledgeDoc = {
            title: suggestedTitle,
            content: extractedText,
            category: formData.category || 'general',
            tags: tagsArray,
            source: formData.source || 'document',
            sourceUrl: formData.sourceUrl || fileUrl,
            documentUrl: fileUrl,
            fileName: fileName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          const db = getDb();
          const docRef = await db.collection('knowledgeBase').add(knowledgeDoc);
          console.log(`[Upload Knowledge Base] Added document directly: ${docRef.id} - "${suggestedTitle}"`);

          return res.status(200).send({
            success: true,
            message: 'Document uploaded and added to knowledge base',
            documentId: docRef.id,
            title: suggestedTitle,
            extractedText: extractedText,
            fileUrl: fileUrl,
          });
        }

        // Return extracted text and suggestions for manual review
        res.status(200).send({
          success: true,
          extractedText: extractedText,
          title: suggestedTitle,
          suggestedTags: suggestedTags,
          suggestedCategory: formData.category || 'general',
          fileUrl: fileUrl,
          fileName: fileName,
        });

      } catch (error) {
        console.error('[Upload Knowledge Base] Error:', error);
        
        // Clean up temp file if it exists
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        res.status(500).send({
          success: false,
          error: error.message || 'Failed to process document',
        });
      }
    });

    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  });
};

