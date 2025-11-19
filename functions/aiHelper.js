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
        // Trim API key to remove any whitespace/newlines
        const openRouterKey = (keys.openrouter || '').trim();
        
        const headers = {
          'Authorization': `Bearer ${openRouterKey}`,
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
      
      // Trim API key to remove any whitespace/newlines
      const openRouterKey = (keys.openrouter || '').trim();
      
      const headers = {
        'Authorization': `Bearer ${openRouterKey}`,
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

/**
 * Analyzes an image using OpenRouter with Gemini Vision model to generate tags and suggest category.
 * @param {string} imageUrl - Public URL of the image to analyze
 * @param {object} keys - Object containing API keys { gemini, openrouter }
 * @returns {Promise<object>} Object with tags array, category string, and optional description
 */
async function analyzeImageWithAI(imageUrl, keys) {
  const fetch = (await import('node-fetch')).default;
  
  const prompt = `Analyze this image from a PETRONAS Upstream gallery and provide:
1. 5-10 relevant tags (comma-separated keywords that describe the image content, people, activities, equipment, locations, etc.)
2. Best category from this exact list: Stock Images, Events, Team Photos, Infographics, Operations, Facilities
3. A brief description (1-2 sentences)

Return your response in JSON format only:
{
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Events",
  "description": "Brief description here"
}

Focus on identifying:
- What type of image it is (photo, graphic, infographic, etc.)
- Main subjects (people, equipment, facilities, etc.)
- Context (events, operations, team activities, etc.)
- Visual style (corporate, casual, technical, etc.)`;

  // Model list with fallback - try multiple models that support image analysis
  // Order: Try most capable models first, then fallback to simpler ones
  const modelsToTry = [
    'google/gemini-2.5-flash-image-preview',  // Primary: Gemini with image support
    'openai/gpt-4o',                          // OpenAI vision model
    'openai/gpt-4-turbo',                    // OpenAI vision model (alternative)
    'anthropic/claude-3.5-sonnet',            // Claude vision model
    'anthropic/claude-3-opus',                // Claude vision model (alternative)
    'google/gemini-2.5-flash',                // Gemini (may support images)
    'google/gemini-3-pro-preview'             // Keep as last fallback
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[analyzeImageWithAI] Attempting to analyze image with model: ${model}`);
      console.log(`[analyzeImageWithAI] Image URL: ${imageUrl.substring(0, 100)}...`);
      
      // Trim API key to remove any whitespace/newlines
      const openRouterKey = (keys.openrouter || '').trim();
      
      if (!openRouterKey) {
        throw new Error('OpenRouter API key is missing or empty');
      }
      
      const headers = {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
        'X-Title': 'Systemic Shift AI Image Analysis',
      };

      // OpenRouter supports image URLs directly in the message content
      const body = {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      };

      // Log request details (sanitized - no API key)
      console.log(`[analyzeImageWithAI] Request details:`, {
        model: model,
        url: OPENROUTER_CHAT_URL,
        imageUrlLength: imageUrl.length,
        hasOpenRouterKey: !!keys.openrouter
      });

      const response = await fetch(OPENROUTER_CHAT_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      console.log(`[analyzeImageWithAI] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[analyzeImageWithAI] OpenRouter API error (${response.status}):`, errorText);
        throw new Error(`OpenRouter error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`[analyzeImageWithAI] Response received, checking format...`);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`[analyzeImageWithAI] Invalid response format:`, JSON.stringify(data).substring(0, 500));
        throw new Error('Invalid response format from OpenRouter: missing choices or message');
      }
      
      const resultText = data.choices[0].message.content;
      console.log(`[analyzeImageWithAI] Response content length: ${resultText.length} characters`);
      
      // Parse JSON from response
      let jsonText = resultText.trim();
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(jsonText);
        console.log(`[analyzeImageWithAI] Successfully parsed JSON response`);
      } catch (parseError) {
        console.error(`[analyzeImageWithAI] JSON parse error:`, parseError.message);
        console.error(`[analyzeImageWithAI] JSON text (first 500 chars):`, jsonText.substring(0, 500));
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
      
      // Validate and normalize the response
      if (!analysisResult.tags || !Array.isArray(analysisResult.tags)) {
        console.error(`[analyzeImageWithAI] Invalid response: tags missing or not an array`);
        throw new Error('Invalid response format: tags missing or not an array');
      }
      
      if (!analysisResult.category) {
        console.error(`[analyzeImageWithAI] Invalid response: category missing`);
        throw new Error('Invalid response format: category missing');
      }
      
      // Ensure category is from the allowed list
      const allowedCategories = ['Stock Images', 'Events', 'Team Photos', 'Infographics', 'Operations', 'Facilities'];
      if (!allowedCategories.includes(analysisResult.category)) {
        // Try to match closest category
        const originalCategory = analysisResult.category;
        const categoryLower = analysisResult.category.toLowerCase();
        if (categoryLower.includes('event') || categoryLower.includes('meeting') || categoryLower.includes('gathering')) {
          analysisResult.category = 'Events';
        } else if (categoryLower.includes('team') || categoryLower.includes('people') || categoryLower.includes('staff')) {
          analysisResult.category = 'Team Photos';
        } else if (categoryLower.includes('infographic') || categoryLower.includes('graphic') || categoryLower.includes('chart')) {
          analysisResult.category = 'Infographics';
        } else if (categoryLower.includes('operation') || categoryLower.includes('field') || categoryLower.includes('production')) {
          analysisResult.category = 'Operations';
        } else if (categoryLower.includes('facility') || categoryLower.includes('plant') || categoryLower.includes('infrastructure')) {
          analysisResult.category = 'Facilities';
        } else {
          analysisResult.category = 'Stock Images'; // Default fallback
        }
        console.log(`[analyzeImageWithAI] Normalized category from "${originalCategory}" to "${analysisResult.category}"`);
      }
      
      console.log(`[analyzeImageWithAI] Successfully analyzed image with ${model}`, {
        category: analysisResult.category,
        tagsCount: analysisResult.tags.length,
        hasDescription: !!analysisResult.description
      });
      
      return {
        tags: analysisResult.tags.slice(0, 10), // Limit to 10 tags
        category: analysisResult.category,
        description: analysisResult.description || ''
      };

    } catch (error) {
      console.error(`[analyzeImageWithAI] Error with model ${model}:`, {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500)
      });
      lastError = error;
      
      // If this is not the last model, try the next one
      if (model !== modelsToTry[modelsToTry.length - 1]) {
        console.log(`[analyzeImageWithAI] Attempting fallback to next model...`);
        continue;
      }
    }
  }

  // If we get here, all models failed
  console.error('[analyzeImageWithAI] All models failed. Last error:', lastError?.message);
  throw new Error(`Failed to analyze image with all models: ${lastError?.message || 'Unknown error'}`);
}

module.exports = {
  generateWithFallback,
  extractTextFromFiles,
  generateImage,
  analyzeImageWithAI // Export the new image analysis function
};
