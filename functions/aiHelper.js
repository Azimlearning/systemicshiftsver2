
// functions/aiHelper.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getStorage } = require("firebase-admin/storage");
const pdf = require('pdf-parse'); // For PDF extraction
const mammoth = require('mammoth'); // For .docx extraction
const { createWorker } = require('tesseract.js'); // For Image OCR
const os = require('os');
const fs = require('fs');
const path = require('path');

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Defines the chain of AI models to try, in order gemini-2.0-flash-exp.
 * We use reliable, standard models.
 */
const AI_MODEL_CHAIN = [
  { type: 'gemini', model: 'gemini-pro' },
  { type: 'gemini', model: 'gemini-2.0-flash-exp' },
  { type: 'gemini', model: 'gemini-2.0-flash-lite' },
  { type: 'gemini', model: 'gemini-2.0-flash-preview-image-generation' },
  { type: 'gemini', model: 'gemini-2.0-flash' },
  { type: 'gemini', model: 'gemini-2.5-flash-lite' },
  { type: 'gemini', model: 'ggemini-2.5-flash' },
  { type: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
  { type: 'openrouter', model: 'z-ai/glm-4-32b' },
  { type: 'openrouter', model: 'openai/gpt-oss-20b:free' },
  { type: 'openrouter', model: 'openai/gpt-5-nano' },
  { type: 'openrouter', model: 'openai/gpt-oss-120b' },
  { type: 'openrouter', model: 'z-ai/glm-4.5-air:free' },
  { type: 'openrouter', model: 'openai/gpt-3.5-turbo' }
];

/**
 * Tries to generate content by iterating through a chain of AI models.
 */
async function generateWithFallback(prompt, keys, outputJson = false) {
  const fetch = (await import('node-fetch')).default;
  let lastError = null;

  for (const config of AI_MODEL_CHAIN) {
    try {
      console.log(`Attempting to generate content with model: ${config.model}`);
      let resultText;

      if (config.type === 'gemini') {
        // --- Call Google Gemini API ---
        const genAI = new GoogleGenerativeAI(keys.gemini);
        const model = genAI.getGenerativeModel({ model: config.model });
        
        const generationConfig = outputJson ? { responseMimeType: "application/json" } : {};
        const result = await model.generateContent(prompt, generationConfig);
        resultText = result.response.text();

      } else if (config.type === 'openrouter') {
        // --- Call OpenRouter API ---
        const headers = {
          'Authorization': `Bearer ${keys.openrouter}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI',
        };

        const body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: outputJson ? { type: 'json_object' } : { type: 'text' },
        };

        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        resultText = data.choices[0].message.content;
      }

      console.log(`Successfully generated content with model: ${config.model}`);
      const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim();
      return cleanedText; // Success!

    } catch (error) {
      console.warn(`Failed to generate content with model ${config.model}:`, error.message);
      lastError = error; // Save the error and try the next model
    }
  }

  // If all models in the chain failed
  console.error("All AI models in the fallback chain failed.", lastError);
  throw lastError;
}

/**
 * Downloads a file from Storage and extracts its text content.
 * Now handles PDF, DOCX, and Images (PNG, JPG, JPEG).
 */
async function extractTextFromFiles(storyData) {
  const fileUrl = storyData.writeUpURL; // We'll focus on the 'writeUp' file
  if (!fileUrl) {
    console.log("No writeUpURL found, skipping text extraction.");
    return "";
  }

  const fileUrlObj = new URL(fileUrl);
  const filePath = decodeURIComponent(fileUrlObj.pathname).replace(/^\/v0\/b\/[^\/]+\/o\//, '');
  
  const fileExt = path.extname(filePath).toLowerCase();
  const allowedTextExt = ['.pdf', '.docx'];
  const allowedImageExt = ['.png', '.jpg', '.jpeg'];

  if (!allowedTextExt.includes(fileExt) && !allowedImageExt.includes(fileExt)) {
    console.log(`File type (${fileExt}) is not supported for text extraction.`);
    return "";
  }

  const bucket = getStorage().bucket("systemicshiftv2.firebasestorage.app"); // Use your bucket name
  const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

  try {
    console.log(`Downloading file from Storage: ${filePath}`);
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log(`File downloaded to: ${tempFilePath}`);

    let extractedText = "";
    if (allowedTextExt.includes(fileExt)) {
      // --- Handle PDF and DOCX ---
      if (fileExt === '.pdf') {
        const dataBuffer = fs.readFileSync(tempFilePath);
        const data = await pdf(dataBuffer);
        extractedText = data.text;
      } else if (fileExt === '.docx') {
        const result = await mammoth.extractRawText({ path: tempFilePath });
        extractedText = result.value;
      }
    } else if (allowedImageExt.includes(fileExt)) {
      // --- Handle Images (OCR) ---
      console.log("Starting OCR process for image...");
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(tempFilePath);
      extractedText = text;
      await worker.terminate();
      console.log("OCR process finished.");
    }

    fs.unlinkSync(tempFilePath); // Clean up the temporary file
    console.log("File text extracted successfully.");
    return extractedText;

  } catch (error) {
    console.error("Error during file text extraction:", error);
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath); // Clean up on error
    }
    return ""; // Return empty string on failure
  }
}

module.exports = {
  generateWithFallback,
  extractTextFromFiles
};
