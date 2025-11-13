
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

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

// Config via env
const HF_MODEL = process.env.HF_MODEL || "runwayml/stable-diffusion-v1-5";
const BUCKET_NAME = process.env.IMAGE_BUCKET_NAME || process.env.IMAGE_BUCKET || "";
const IMAGE_FOLDER = process.env.IMAGE_FOLDER || "generated_images";

// Helper: get HF token (prefer env var; if not present, throw - simpler & less error-prone)
function getHfTokenOrThrow() {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    throw new Error("HF_API_TOKEN not set. Deploy function with --set-secrets=HF_API_TOKEN=HF_API_TOKEN:latest or set HF_API_TOKEN env var.");
  }
  return token.trim();
}

// Use the new router endpoint as Hugging Face now requires routing requests there.
async function callHfRouter(hfToken, model, prompt, opts = {}) {
  const url = "https://router.huggingface.co/hf-inference";
  const body = {
    model: model,
    inputs: prompt,
    parameters: {
      num_inference_steps: opts.steps || 20,
      guidance_scale: opts.guidance || 7.5,
      width: opts.width || 512,
      height: opts.height || 512
    },
    options: { wait_for_model: true }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Hugging Face API error ${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const j = await res.json();
    // Try common shapes: array of objects with b64 or generated_image fields or data[].b64_json
    if (Array.isArray(j) && j.length > 0 && typeof j[0] === "object") {
      const first = j[0];
      const b64 = first.generated_image || first.image || first.b64_json || first.b64 ||
                  (first.data && first.data[0] && first.data[0].b64_json);
      if (b64) return Buffer.from(b64, "base64");
    }
    // router sometimes returns {"error": "..."} or other structured responses
    throw new Error("Unexpected JSON response from HF router: " + JSON.stringify(j).slice(0, 800));
  } else {
    // binary image
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
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

    const hfToken = getHfTokenOrThrow();

    const imgBuffer = await callHfRouter(hfToken, HF_MODEL, prompt, { width, height, steps, guidance });

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
