
/**
 * functions/generate_image_hf.js
 *
 * Updated:
 * - Prefer HF token from process.env.HF_API_TOKEN (works when you deploy with --set-secrets).
 * - Call the new Hugging Face router endpoint to avoid 410 deprecation.
 * - Upload PNG to Cloud Storage and optionally update Firestore.
 *
 * npm dependencies:
 *   npm install node-fetch @google-cloud/storage firebase-admin
 *
 * Deployment recommendation:
 *   Use `--set-secrets=HF_API_TOKEN=HF_API_TOKEN:latest` when deploying so HF_API_TOKEN is available as an env var.
 */

const fetch = require("node-fetch");
const { Storage } = require("@google-cloud/storage");
const admin = require("firebase-admin");

// Only initialize if not already initialized (prevents duplicate app error)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const storage = new Storage();

// Config via env
// Using CompVis/stable-diffusion-v1-4 which is widely available and doesn't require license acceptance
// Alternative: runwayml/stable-diffusion-v1-5 or stabilityai/stable-diffusion-2-1
const HF_MODEL = process.env.HF_MODEL || "CompVis/stable-diffusion-v1-4";
const BUCKET_NAME = process.env.IMAGE_BUCKET_NAME || process.env.IMAGE_BUCKET || "systemicshiftv2.firebasestorage.app";
const IMAGE_FOLDER = process.env.IMAGE_FOLDER || "generated_images";

// Helper: get HF token (prefer env var; if not present, throw - simpler & less error-prone)
function getHfTokenOrThrow() {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    throw new Error("HF_API_TOKEN not set. Deploy function with --set-secrets=HF_API_TOKEN=HF_API_TOKEN:latest or set HF_API_TOKEN env var.");
  }
  return token.trim();
}

// Use the new Hugging Face Router API (required as of 2024)
async function callHfRouter(hfToken, model, prompt, opts = {}) {
  // New router endpoint - this is the only supported endpoint now
  const url = "https://router.huggingface.co/hf-inference";
  
  // Router API format - model name goes in the body, not the URL
  const body = {
    model: model,
    inputs: prompt,
    parameters: {}
  };
  
  // Add parameters if provided
  if (opts.steps) body.parameters.num_inference_steps = opts.steps;
  if (opts.guidance) body.parameters.guidance_scale = opts.guidance;
  if (opts.width) body.parameters.width = opts.width;
  if (opts.height) body.parameters.height = opts.height;
  
  // Options for model loading
  body.options = { 
    wait_for_model: true
  };

  // Add timeout (5 minutes max for image generation)
  const timeoutMs = 300000; // 5 minutes
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[callHfRouter] Calling Hugging Face API for model ${model} at ${url}`);
    console.log(`[callHfRouter] Prompt length: ${prompt.length}, Steps: ${opts.steps || 20}, Size: ${opts.width || 512}x${opts.height || 512}`);
    console.log(`[callHfRouter] Request body: ${JSON.stringify(body).substring(0, 200)}`);
    
    // Use the actual token, not a substring
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    console.log(`[callHfRouter] Response status: ${res.status}, statusText: ${res.statusText}`);
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[callHfRouter] Hugging Face API error ${res.status}`);
      console.error(`[callHfRouter] Response headers:`, JSON.stringify(Object.fromEntries(res.headers.entries())));
      console.error(`[callHfRouter] Response text: ${text.substring(0, 1000)}`);
      
      // Check if it's a model loading issue
      if (res.status === 503) {
        throw new Error(`Model is loading. Please try again in a few moments. Response: ${text.substring(0, 500)}`);
      }
      
      throw new Error(`Hugging Face API error ${res.status}: ${text.substring(0, 500)}`);
    }

    const contentType = res.headers.get("content-type") || "";
    console.log(`[callHfRouter] Response content-type: ${contentType}`);
    
    // Hugging Face Inference API typically returns binary PNG directly
    if (contentType.includes("image/") || contentType.includes("application/octet-stream")) {
      // Binary image data
      const arrayBuf = await res.arrayBuffer();
      console.log(`[callHfRouter] Received binary image, size: ${arrayBuf.byteLength} bytes`);
      return Buffer.from(arrayBuf);
    } else if (contentType.includes("application/json")) {
      // JSON response (might be error or structured data)
      const j = await res.json();
      console.log(`[callHfRouter] Received JSON response: ${JSON.stringify(j).substring(0, 200)}`);
      
      // Check for error in JSON
      if (j.error) {
        throw new Error(`Hugging Face API error: ${j.error}`);
      }
      
      // Try common shapes: array of objects with b64 or generated_image fields
      if (Array.isArray(j) && j.length > 0 && typeof j[0] === "object") {
        const first = j[0];
        const b64 = first.generated_image || first.image || first.b64_json || first.b64 ||
                    (first.data && first.data[0] && first.data[0].b64_json);
        if (b64) {
          console.log(`[callHfRouter] Found base64 image in JSON response`);
          return Buffer.from(b64, "base64");
        }
      }
      
      // If we get here, it's an unexpected JSON format
      throw new Error("Unexpected JSON response from HF API: " + JSON.stringify(j).slice(0, 800));
    } else {
      // Unknown content type, try to read as binary
      console.log(`[callHfRouter] Unknown content-type, attempting to read as binary`);
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Hugging Face API request timed out after ${timeoutMs/1000} seconds. The model may be overloaded or unavailable.`);
    }
    throw error;
  }
}

async function uploadToGcs(buffer, filename) {
  if (!BUCKET_NAME) throw new Error("IMAGE_BUCKET_NAME or IMAGE_BUCKET not configured");
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(filename);
  await file.save(buffer, { contentType: "image/png", resumable: false });
  // For convenience we make public. In production prefer signed URLs.
  await file.makePublic();
  return `https://storage.googleapis.com/${BUCKET_NAME}/${encodeURIComponent(filename)}`;
}

exports.generateImageHf = async (req, res) => {
  // Handle CORS for browser requests (though this is mainly called from other Cloud Functions)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

    const body = req.body || {};
    const prompt = body.prompt;
    const docId = body.docId;
    const width = body.width || 512;
    const height = body.height || 512;
    const steps = body.num_inference_steps || body.steps || 20;
    const guidance = body.guidance_scale || body.guidance || 7.5;

    if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "prompt (string) is required" });

    console.log(`[generateImageHf] Starting image generation for docId: ${docId || 'none'}`);
    console.log(`[generateImageHf] Model: ${HF_MODEL}, Size: ${width}x${height}, Steps: ${steps}`);
    
    const hfToken = getHfTokenOrThrow();
    console.log(`[generateImageHf] Token retrieved: ${hfToken ? 'YES (length: ' + hfToken.length + ')' : 'NO'}`);
    console.log(`[generateImageHf] Token prefix: ${hfToken ? hfToken.substring(0, 7) : 'N/A'}`);
    
    const startTime = Date.now();

    const imgBuffer = await callHfRouter(hfToken, HF_MODEL, prompt, { width, height, steps, guidance });
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[generateImageHf] Image generated successfully in ${elapsedTime}s, size: ${imgBuffer.length} bytes`);

    const filename = `${IMAGE_FOLDER}/${Date.now()}_${Math.random().toString(36).slice(2,10)}.png`;
    const publicUrl = await uploadToGcs(imgBuffer, filename);

    if (docId) {
      try {
        await db.collection("stories").doc(docId).update({
          aiGeneratedImageUrl: publicUrl,
          analysisTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to update Firestore doc:", e);
      }
    }

    return res.status(200).json({ status: "ok", image_url: publicUrl });
  } catch (err) {
    console.error("generateImageHf error:", err);
    if (err.message && err.message.toLowerCase().includes("permission denied")) {
      // likely secret not accessible or token invalid
      return res.status(403).json({ status: "error", message: err.message });
    }
    if (err.message && err.message.toLowerCase().includes("hugging face api error")) {
      return res.status(502).json({ status: "error", message: err.message });
    }
    return res.status(500).json({ status: "error", message: err.message || String(err) });
  }
};
