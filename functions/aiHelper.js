// functions/aiHelper.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getStorage } = require("firebase-admin/storage");
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { createWorker } = require('tesseract.js');
const os = require('os');
const fs = require('fs');
const path = require('path');

// --- NEW: Import Model Definitions ---
const { TEXT_GENERATION_MODELS, IMAGE_GENERATION_MODELS } = require('./ai_models');
// --- END NEW ---

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/images/generations";

/**
 * Tries to generate text content by iterating through a model chain.
 */
async function generateWithFallback(prompt, keys, outputJson = false) {
  // Use the text chain
  const AI_MODEL_CHAIN = TEXT_GENERATION_MODELS; 
  const fetch = (await import('node-fetch')).default;
  let lastError = null;

  for (const config of AI_MODEL_CHAIN) {
    try {
      console.log(`Attempting to generate content with model: ${config.model}`);
      let resultText;

      if (config.type === 'gemini') {
        // --- Call Google Gemini API (using API Key) ---
        const genAI = new GoogleGenerativeAI(keys.gemini);
        const model = genAI.getGenerativeModel({ model: config.model });
        
        const generationConfig = outputJson ? { responseMimeType: "application/json" } : {};
        const result = await model.generateContent(prompt, generationConfig);
        resultText = result.response.text();

      } else if (config.type === 'openrouter') {
        // --- Call OpenRouter Chat API ---
        // --- CRITICAL FIX: Access key from environment variable and ensure it's a string ---
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const headers = {
          'Authorization': `Bearer ${openRouterKey.trim()}`, // Trim is now applied to the ENV var
          'Content-Type': 'application/json',
          'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
          'X-Title': 'Systemic Shift AI',
        };

        const body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: outputJson ? { type: 'json_object' } : { type: 'text' },
        };

        const response = await fetch(OPENROUTER_CHAT_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter error (${response.status}) on ${config.model}: ${errText}`);
        }

        const data = await response.json();
        resultText = data.choices[0].message.content;
      }

      console.log(`Successfully generated content with model: ${config.model}`);
      const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim();
      return cleanedText; // Success!

    } catch (error) {
      console.warn(`Failed to generate content with model ${config.model}:`, error.message);
      lastError = error;
    }
  }

  // If all models in the chain failed
  console.error("All AI models in the fallback chain failed.", lastError);
  throw lastError;
}

/**
 * Generates an image using OpenRouter Image Models with fallback.
 */
async function generateImage(infographicConcept, keys) {
  const fetch = (await import('node-fetch')).default;
  const IMAGE_MODEL_CHAIN = IMAGE_GENERATION_MODELS;
  const concept = infographicConcept;

  const visualPrompt = `Create a professional, flat-design corporate infographic for PETRONAS Upstream. Use a vertical layout. Color palette MUST primarily use TEAL, WHITE, and LIGHT GRAY.\nTitle: "${concept.title || 'Optimizing Operations'}"\nSections: Describe the content using simple, clear icons and bold metrics.\nKey Metrics: ${concept.keyMetrics?.map(m => `${m.label}: ${m.value}`).join('; ') || 'N/A'};\nVisual Style: ${concept.visualStyle || 'Flat design, minimal icons, professional, modern.'}\n\nDo NOT include text directly on the image. Focus on visual representation of the data and corporate themes.`;

  let lastError = null;
  for (const config of IMAGE_MODEL_CHAIN) {
    try {
      console.log(`Image Gen: Attempting model ${config.model}`);
      
      // --- CRITICAL FIX: Access key from environment variable and ensure it's a string ---
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const headers = {
        'Authorization': `Bearer ${openRouterKey.trim()}`, // Trim is now applied to the ENV var
        'Content-Type': 'application/json',
        'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
        'X-Title': 'Systemic Shift AI Image',
      };

      const response = await fetch(OPENROUTER_IMAGE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: config.model,
          prompt: visualPrompt,
          size: "1024x1024",
          n: 1,
          response_format: "url", 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image API Error (${response.status}) on ${config.model}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const tempImageUrl = data.data[0].url;
        console.log(`Image Gen: Successful URL received from ${config.model}.`);
        return tempImageUrl; // Success!
      }
      
      throw new Error("Image API did not return a valid URL in response data.");

    } catch (error) {
      console.warn(`Image Gen Failed (${config.model}): ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`All image models failed: ${lastError ? lastError.message : "Unknown error."}`);
}

/**
 * Downloads a file from Storage and extracts its text content.
 */
async function extractTextFromFiles(storyData) {
    const fileUrl = storyData.writeUpURL;
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

    const bucket = getStorage().bucket("systemicshiftv2.firebasestorage.app");
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

    try {
        console.log(`Downloading file from Storage: ${filePath}`);
        await bucket.file(filePath).download({ destination: tempFilePath });
        console.log(`File downloaded to: ${tempFilePath}`);

        let extractedText = "";
        if (allowedTextExt.includes(fileExt)) {
            if (fileExt === '.pdf') {
                const dataBuffer = fs.readFileSync(tempFilePath);
                const data = await pdf(dataBuffer);
                extractedText = data.text;
            } else if (fileExt === '.docx') {
                const result = await mammoth.extractRawText({ path: tempFilePath });
                extractedText = result.value;
            }
        } else if (allowedImageExt.includes(fileExt)) {
            console.log("Starting OCR process for image...");
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(tempFilePath);
            extractedText = text;
            await worker.terminate();
            console.log("OCR process finished.");
        }

        fs.unlinkSync(tempFilePath);
        console.log("File text extracted successfully.");
        return extractedText;

    } catch (error) {
        console.error("Error during file text extraction:", error);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        return "";
    }
}

module.exports = {
  generateWithFallback,
  extractTextFromFiles,
  generateImage // Export the new image function
};
