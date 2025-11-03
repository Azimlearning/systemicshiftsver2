// functions/aiHelper.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getStorage } = require("firebase-admin/storage");
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { createWorker } = require('tesseract.js');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// --- NEW: Import Model Definitions ---
const { TEXT_GENERATION_MODELS, IMAGE_GENERATION_MODELS } = require('./ai_models');
// --- END NEW ---

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_IMAGE_URL = OPENROUTER_CHAT_URL;
const STORAGE_BUCKET = "systemicshiftv2.firebasestorage.app";

/**
 * Tries to generate text content by iterating through a model chain.
 */
async function generateWithFallback(prompt, keys, outputJson = false) {
  // Use the text chain
  const AI_MODEL_CHAIN = TEXT_GENERATION_MODELS; 
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
 * Analyzes example infographics to extract style patterns.
 * Returns a style guide based on examples in the public folder.
 */
async function analyzeExampleInfographicStyles(keys) {
  // Example infographic style patterns based on the folder structure
  // In production, you could use Gemini Vision API to analyze actual images
  const styleGuide = {
    layout: "Vertical layout with sections stacked from top to bottom",
    colorPalette: {
      primary: "Teal (#00A896 or similar corporate teal)",
      secondary: "White (#FFFFFF) for backgrounds and negative space",
      accent: "Light Gray (#F5F5F5 or #E0E0E0) for subtle divisions",
      text: "Dark Gray (#333333 or #1A1A1A) for headings, Black for body text"
    },
    typography: {
      headings: "Bold, clean sans-serif fonts (Montserrat, Poppins, or similar)",
      body: "Legible sans-serif (Lato, Open Sans, or similar)",
      size: "Large headings for impact, readable body text"
    },
    imagery: {
      icons: "Modern, minimal flat icons for concepts",
      illustrations: "Clean, professional illustrations with subtle hand-drawn feel",
      photos: "High-quality corporate imagery when needed"
    },
    composition: {
      sections: "Clear section breaks with subtle dividers",
      spacing: "Generous white space between elements",
      alignment: "Centered or left-aligned text blocks",
      metrics: "Large, bold numbers for key statistics"
    }
  };

  return styleGuide;
}

/**
 * Generates an image using OpenRouter Image Models with fallback.
 * Enhanced with example infographic style analysis.
 */
async function generateImage(infographicConcept, keys) {
  const IMAGE_MODEL_CHAIN = IMAGE_GENERATION_MODELS;
  const concept = infographicConcept;

  // Validate API key
  if (!keys.openrouter || typeof keys.openrouter !== 'string' || keys.openrouter.trim().length === 0) {
    throw new Error("Invalid OpenRouter API key provided for image generation.");
  }

  // Get style guide from example infographics
  const styleGuide = await analyzeExampleInfographicStyles(keys);
  
  // Build enhanced visual prompt with style guidance
  const styleDescription = `Style Requirements (based on PETRONAS corporate infographic examples):
- Layout: ${styleGuide.layout}
- Colors: Primary ${styleGuide.colorPalette.primary}, Background ${styleGuide.colorPalette.secondary}, Accents ${styleGuide.colorPalette.accent}
- Typography: ${styleGuide.typography.headings} for headings, ${styleGuide.typography.body} for body text
- Icons: ${styleGuide.imagery.icons}
- Composition: ${styleGuide.composition.sections}, ${styleGuide.composition.spacing}, ${styleGuide.composition.alignment}`;

  const visualPrompt = `Create a professional corporate infographic for PETRONAS Upstream following these exact style guidelines:

${styleDescription}

Content Requirements:
- Title: "${concept.title || 'Optimizing Operations'}"
- Key Metrics: ${concept.keyMetrics?.map(m => `${m.label}: ${m.value}`).join('; ') || 'N/A'}
- Sections: ${concept.sections?.map(s => s.title || s).join(', ') || 'Main content sections'}
- Additional Style Notes: ${concept.visualStyle || 'Flat design, minimal icons, professional, modern.'}
${concept.colorPalette ? `- Color Palette: ${JSON.stringify(concept.colorPalette)}` : ''}

IMPORTANT: Follow the vertical layout with clear sections. Use the specified color palette (TEAL, WHITE, LIGHT GRAY). Do NOT include text directly on the image - focus on visual representation with icons, graphics, and layout structure.`;

  let lastError = null;
  for (const config of IMAGE_MODEL_CHAIN) {
    try {
      console.log(`Image Gen: Attempting model ${config.model}`);
      
      // Validate and sanitize API key
      const apiKey = String(keys.openrouter).trim();
      if (!apiKey || apiKey.length < 10) {
        throw new Error("Invalid API key format");
      }

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'HTTP-Referer': `https://console.firebase.google.com/project/${process.env.GCP_PROJECT || 'systemicshiftv2'}`,
        'X-Title': 'Systemic Shift AI Image',
      };

      const payload = {
        model: config.model,
        messages: [
          {
            role: 'user',
            content: visualPrompt,
          },
        ],
        modalities: ['text', 'image'],
        image_config: {
          aspect_ratio: '1:1',
        },
      };

      const response = await fetch(OPENROUTER_IMAGE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      // Safe JSON parsing for error responses
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        try {
          if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            errorData = text ? JSON.parse(text) : { error: 'Empty response' };
          } else {
            const text = await response.text();
            errorData = { error: text.substring(0, 500) || `HTTP ${response.status}` };
          }
        } catch (parseError) {
          errorData = { error: `Failed to parse error response: ${parseError.message}` };
        }
        throw new Error(`Image API Error (${response.status}) on ${config.model}: ${JSON.stringify(errorData)}`);
      }

      // Safe JSON parsing for success responses
      // Read response text once - it can only be consumed once
      const responseText = await response.text();
      let data;
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Empty response from image API");
      }
      
      const contentType = response.headers.get('content-type');
      try {
        if (contentType && contentType.includes('application/json')) {
          try {
            data = JSON.parse(responseText);
          } catch (jsonError) {
            throw new Error(`Unable to parse JSON response: ${jsonError.message}. Payload snippet: ${responseText.substring(0, 200)}...`);
          }
        } else {
          throw new Error(`Unexpected content type: ${contentType || 'unknown'}. Response snippet: ${responseText.substring(0, 200)}...`);
        }
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
      
      if (!data) {
        throw new Error("Empty response from image API");
      }
      
      const message = data.choices?.[0]?.message;
      const imageEntry = message?.images?.find(img => img?.type === 'image_url' && img.image_url);

      if (!imageEntry) {
        throw new Error(`Image API did not return an image payload. Response structure: ${JSON.stringify(data).substring(0, 200)}`);
      }

      const rawImageUrl = imageEntry.image_url?.url || imageEntry.image_url;

      if (!rawImageUrl) {
        throw new Error(`Image API returned empty image URL. Full response: ${JSON.stringify(data).substring(0, 500)}`);
      }

      return await persistImageFromRawUrl(rawImageUrl, config.model);

    } catch (error) {
      console.warn(`Image Gen Failed (${config.model}): ${error.message}`);
      lastError = error;
    }
  }

  try {
    const pythonResult = await tryPythonImageGenerator(visualPrompt, IMAGE_MODEL_CHAIN[0]?.model || 'python-fallback', keys);
    if (pythonResult && pythonResult.image_url) {
      return await persistImageFromRawUrl(pythonResult.image_url, pythonResult.model || 'python-fallback');
    }
  } catch (pythonError) {
    console.warn(`Python image generation fallback failed: ${pythonError.message}`);
    lastError = pythonError;
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

    const bucket = getStorage().bucket(STORAGE_BUCKET);
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

async function persistImageFromRawUrl(rawImageUrl, modelLabel) {
  if (!rawImageUrl || typeof rawImageUrl !== 'string') {
    throw new Error('Image response missing valid url field.');
  }

  let imageBuffer;
  let fileExtension = 'png';
  let mimeType = 'image/png';

  if (rawImageUrl.startsWith('data:')) {
    const dataUrlMatch = rawImageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      throw new Error('Unsupported data URL format received from image API.');
    }

    mimeType = dataUrlMatch[1];
    const base64Payload = dataUrlMatch[2];
    imageBuffer = Buffer.from(base64Payload, 'base64');

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      fileExtension = 'jpg';
      mimeType = 'image/jpeg';
    } else if (mimeType.includes('png')) {
      fileExtension = 'png';
      mimeType = 'image/png';
    } else {
      fileExtension = 'png';
      mimeType = 'image/png';
    }
  } else {
    console.log(`Image Gen: Downloading image from URL (model=${modelLabel})...`);
    try {
      const imageResponse = await fetch(rawImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: HTTP ${imageResponse.status}`);
      }

      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      imageBuffer = await imageResponse.buffer();

      if (contentType.includes('jpeg') || contentType.includes('jpg') || rawImageUrl.includes('.jpg') || rawImageUrl.includes('.jpeg')) {
        fileExtension = 'jpg';
        mimeType = 'image/jpeg';
      } else if (contentType.includes('png') || rawImageUrl.includes('.png')) {
        fileExtension = 'png';
        mimeType = 'image/png';
      } else {
        fileExtension = 'png';
        mimeType = 'image/png';
      }

      console.log(`Image Gen: Downloaded image (${imageBuffer.length} bytes, ${mimeType})`);
    } catch (downloadError) {
      throw new Error(`Failed to download image from URL: ${downloadError.message}`);
    }
  }

  const sanitizedModel = (modelLabel || 'image').replace(/[^a-zA-Z0-9]+/g, '-');
  const fileName = `infographics/generated-${Date.now()}-${sanitizedModel}.${fileExtension}`;

  const bucket = getStorage().bucket(STORAGE_BUCKET);
  const file = bucket.file(fileName);
  await file.save(imageBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        generatedBy: modelLabel || 'unknown',
        generatedAt: new Date().toISOString(),
      },
    },
  });
  await file.makePublic();

  const publicUrl = file.publicUrl();
  console.log(`Image Gen: Stored generated image at ${publicUrl} (${fileExtension.toUpperCase()}, ${imageBuffer.length} bytes)`);
  return publicUrl;
}

async function tryPythonImageGenerator(prompt, model, keys) {
  const scriptCandidates = [
    path.join(__dirname, '..', 'scripts', 'generate_image.py'),
    path.join(__dirname, 'scripts', 'generate_image.py'),
  ];

  const scriptPath = scriptCandidates.find((candidate) => fs.existsSync(candidate));
  if (!scriptPath) {
    console.warn(`Python image generator script not found. Looked in: ${scriptCandidates.join(', ')}`);
    return null;
  }

  const pythonCandidates = process.env.PYTHON_IMAGE_BIN
    ? [process.env.PYTHON_IMAGE_BIN]
    : ['python3', 'python'];

  let lastError = null;
  for (const candidate of pythonCandidates) {
    try {
      const result = await executePythonScript(candidate, scriptPath, prompt, model, keys.openrouter);
      if (result && result.status === 'ok' && result.image_url) {
        return { image_url: result.image_url, model }; // success
      }

      if (result && result.status === 'error') {
        throw new Error(result.message || 'Python script returned an error status.');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        lastError = error;
        continue; // try next candidate
      }
      throw error;
    }
  }

  if (lastError) {
    console.warn(`Python executable not found (${pythonCandidates.join(', ')}).`);
  }
  return null;
}

function executePythonScript(pythonCmd, scriptPath, prompt, model, apiKey) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (apiKey) {
      env.OPENROUTER_API_KEY = apiKey;
    }

    const args = [scriptPath, '--model', model, '--prompt', prompt];
    execFile(pythonCmd, args, { env, maxBuffer: 10 * 1024 * 1024, timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        if (stderr) {
          error.stderr = stderr;
        }
        if (stdout) {
          error.stdout = stdout;
        }
        return reject(error);
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (parseError) {
        parseError.stdout = stdout;
        parseError.stderr = stderr;
        reject(parseError);
      }
    });
  });
}

module.exports = {
  generateWithFallback,
  extractTextFromFiles,
  generateImage // Export the new image function
};
