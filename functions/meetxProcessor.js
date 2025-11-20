// functions/meetxProcessor.js

const { extractTextFromFiles } = require('./aiHelper');
const { generateEmbedding } = require('./embeddingsHelper');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

function getDb() {
  return admin.firestore();
}

function getBucket() {
  return getStorage().bucket("systemicshiftv2.firebasestorage.app");
}

/**
 * Process uploaded meeting file and extract text
 */
async function processMeetingFile(fileUrl, fileName, fileType) {
  try {
    console.log('[MeetX Processor] Processing file:', fileName);

    // Download file from Storage
    const fileUrlObj = new URL(fileUrl);
    const filePath = decodeURIComponent(fileUrlObj.pathname).replace(/^\/v0\/b\/[^\/]+\/o\//, '');
    
    const bucket = getBucket();
    const os = require('os');
    const fs = require('fs');
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

    await bucket.file(filePath).download({ destination: tempFilePath });

    // Extract text based on file type
    let extractedText = '';
    const fileExt = path.extname(fileName).toLowerCase();

    if (fileExt === '.pdf') {
      const pdf = require('pdf-parse');
      const dataBuffer = fs.readFileSync(tempFilePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (fileExt === '.docx' || fileExt === '.doc') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: tempFilePath });
      extractedText = result.value;
    } else if (fileExt === '.txt') {
      extractedText = fs.readFileSync(tempFilePath, 'utf-8');
    }

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    console.log('[MeetX Processor] Extracted text length:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('[MeetX Processor] Error processing file:', error);
    throw error;
  }
}

/**
 * Generate all AI insights for a meeting
 */
async function generateMeetingInsights(meetingId, content, title, keys) {
  try {
    console.log('[MeetX Processor] Generating insights for meeting:', meetingId);

    const { 
      generateMeetingSummary, 
      generateCascadingSummary, 
      checkAlignment, 
      detectActionItems 
    } = require('./meetxAI');

    // Generate all insights in parallel
    const [summary, cascadingSummary, alignmentWarnings, actionItemsData] = await Promise.all([
      generateMeetingSummary(content, keys),
      generateCascadingSummary(content, title, keys),
      checkAlignment(content, title, keys),
      detectActionItems(content, keys)
    ]);

    // Generate embedding for semantic search
    let embedding = null;
    try {
      const textForEmbedding = `${title}\n${content}`.substring(0, 8000);
      embedding = await generateEmbedding(textForEmbedding, keys);
    } catch (embedError) {
      console.warn('[MeetX Processor] Failed to generate embedding:', embedError);
    }

    // Update meeting document
    const db = getDb();
    const meetingRef = db.collection('meetings').doc(meetingId);
    
    const updateData = {
      summary,
      aiInsights: {
        cascadingSummary,
        alignmentWarnings,
        actionItems: actionItemsData.actionItems,
        zombieTasks: actionItemsData.zombieTasks
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (embedding) {
      updateData.embedding = embedding;
    }

    await meetingRef.update(updateData);

    console.log('[MeetX Processor] Successfully generated insights for meeting:', meetingId);
    return updateData;
  } catch (error) {
    console.error('[MeetX Processor] Error generating insights:', error);
    throw error;
  }
}

module.exports = {
  processMeetingFile,
  generateMeetingInsights
};

