// functions/index.js

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

const { generateWithFallback, extractTextFromFiles } = require("./aiHelper");
// UPDATED: Import image models as well
const { TEXT_GENERATION_MODELS, IMAGE_GENERATION_MODELS } = require("./ai_models"); 

const { defineSecret } = require('firebase-functions/params');
const geminiApiKey = defineSecret('GOOGLE_GENAI_API_KEY'); 
const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const bucket = storage.bucket("systemicshiftv2.firebasestorage.app"); 

exports.submitStory = onRequest(
  { 
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 300, 
    memory: '1GB',
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }
      const busboy = Busboy({ headers: req.headers });
      const tmpdir = os.tmpdir();
      let formData = {};
      let fileWrites = [];

      busboy.on("field", (fieldname, val) => {
         if (fieldname.endsWith("[]")) {
               const realName = fieldname.replace("[]", "");
               if (formData[realName]) { formData[realName].push(val); }
               else { formData[realName] = [val]; }
            } else if (fieldname === 'acknowledgement') {
               formData[fieldname] = (val === 'true');
            } else {
               formData[fieldname] = val;
            }
      });

      busboy.on("file", (fieldname, file, filenameDetails) => {
          const { filename, encoding, mimeType } = filenameDetails;
          const filepath = path.join(tmpdir, filename);
          const writeStream = fs.createWriteStream(filepath);
          file.pipe(writeStream);
          const promise = new Promise((resolve, reject) => {
               file.on("end", () => { writeStream.end(); });
               writeStream.on("finish", async () => {
                const uniqueFilename = `${Date.now()}_${filename}`;
                const destination = fieldname === 'writeUp' ? `writeUps/${uniqueFilename}` : `visuals/${uniqueFilename}`;
                try {
                  const [uploadedFile] = await bucket.upload(filepath, {
                    destination: destination,
                    metadata: { contentType: mimeType },
                  });
                  if (fs.existsSync(filepath)) { fs.unlinkSync(filepath); } 
                  await uploadedFile.makePublic();
                  const publicUrl = uploadedFile.publicUrl();
                  resolve({ fieldname, url: publicUrl }); 
                } catch (error) {
                   console.error("Storage Upload Error:", error);
                   if (fs.existsSync(filepath)) { fs.unlinkSync(filepath); }
                   reject(error);
                }
              });
               writeStream.on("error", reject);
          });
          fileWrites.push(promise);
      });

      busboy.on("finish", async () => {
        try {
          const fileResults = await Promise.all(fileWrites);
          let writeUpURL = '';
          let visualURLs = [];
          fileResults.forEach(result => {
            if (result.fieldname === 'writeUp') writeUpURL = result.url;
            else if (result.fieldname === 'visuals') visualURLs.push(result.url);
          });

          const submissionData = {
            ...formData,
            writeUpURL: writeUpURL,
            visualURLs: visualURLs,
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          ['keyShifts', 'focusAreas', 'desiredMindset'].forEach(field => {
              if (!submissionData[field]) submissionData[field] = [];
          });
           if (submissionData.alignsWithShifts === 'null') {
               submissionData.alignsWithShifts = null;
           }
          await db.collection("stories").add(submissionData);
          res.status(200).send({ message: "Story submitted successfully!" });
        } catch (err) {
          console.error("Critical Error in submitStory:", err);
          res.status(500).send({ error: `Failed to process submission: ${err.message}` });
        }
      });

       if (req.rawBody) {
            busboy.end(req.rawBody);
       } else {
            req.pipe(busboy);
       }
    });
});

// --- NEW HELPER FUNCTION for robust image generation ---
async function generateImageWithFallback(prompt, models) {
    const PYTHON_WORKER_URL = "https://imagegeneratorhttp-el2jwxb5bq-uc.a.run.app";
    let lastError = "No models were attempted.";

    for (const model of models) {
        console.log(`Attempting to generate image with model: ${model}`);
        try {
            const response = await fetch(PYTHON_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, model: model }) // Pass the model
            });

            const workerOutput = await response.json();

            if (response.ok && workerOutput.status === 'ok' && workerOutput.image_url) {
                console.log(`Successfully generated image with model: ${workerOutput.model_used}`);
                return workerOutput.image_url; // Success! Return the URL.
            } else {
                 throw new Error(workerOutput.message || `Worker responded with status ${response.status}`);
            }

        } catch (error) {
            console.error(`Failed to generate image with model ${model}. Error: ${error.message}`);
            lastError = `Model ${model} failed: ${error.message}`; // Keep track of the last error
        }
    }

    console.error("All image generation models failed.");
    return `Image generation failed. Last error: ${lastError}`;
}

exports.analyzeStorySubmission = onDocumentCreated(
    { 
        document: 'stories/{storyId}',
        region: 'us-central1', 
        secrets: [geminiApiKey, openRouterApiKey],
        timeoutSeconds: 540, 
        memory: '1GiB',
    },
    async (event) => {
    const snap = event.data;
    if (!snap) {
        console.log("No data associated with the event");
        return;
    }
    const storyData = snap.data();
    const storyId = event.params.storyId;
    console.log(`Analyzing story ID: ${storyId}`);

    const keys = {
      gemini: geminiApiKey.value(),
      openrouter: openRouterApiKey.value()
    };
    
    const extractedFileText = await extractTextFromFiles(storyData);

    let fullContextText = `--- Story Submission Details ---\n`;
    fullContextText += `Title: ${storyData.storyTitle || storyData.nonShiftTitle || 'N/A'}\n`;
    fullContextText += `Aligns with Systemic Shifts?: ${storyData.alignsWithShifts || 'N/A'}\n\n`;
    if (storyData.alignsWithShifts === 'yes') {
        fullContextText += `Key Shifts Supported: ${storyData.keyShifts?.join(', ') || 'N/A'}\n`;
        fullContextText += `Case for Change: ${storyData.caseForChange || 'N/A'}\n`;
    }
    if (extractedFileText) {
      fullContextText += `\n--- Extracted Text from Uploaded Document ---\n${extractedFileText}\n--- End Extracted Text ---\n`;
    }
    fullContextText += `--- End Submission Details ---\n\n`;

    const writeupPrompt = `You are an internal communications writer... ${fullContextText} ... Generate the write-up.`;
    const infographicPrompt = `You are a concept designer... ${fullContextText} ... Generate the infographic concept (JSON object).`;

    let aiWriteup = "AI write-up generation failed.";
    let aiInfographicConcept = { error: "AI infographic concept generation failed." };
    let aiGeneratedImageUrl = "Image generation skipped/failed.";

    try {
      const writeupRaw = await generateWithFallback(writeupPrompt, keys, TEXT_GENERATION_MODELS, false);
      aiWriteup = writeupRaw; 

      const infographicRaw = await generateWithFallback(infographicPrompt, keys, TEXT_GENERATION_MODELS, true);
      
      try {
        aiInfographicConcept = JSON.parse(infographicRaw);
      } catch (parseError) {
         console.error("Failed to parse AI JSON for infographic:", parseError);
         aiInfographicConcept = { error: 'Concept failed to parse.', rawResponse: infographicRaw.substring(0, 500) };
      }

      // --- UPDATED IMAGE GENERATION LOGIC ---
      if (typeof aiInfographicConcept === 'object' && aiInfographicConcept.title) {
          console.log("Attempting to generate image using Python Worker with fallback...");

          const visualPrompt = `Clean, corporate infographic for PETRONAS Upstream. Title: \"${aiInfographicConcept.title}\". Key Metrics: ${aiInfographicConcept.keyMetrics.map(m => `${m.label}: ${m.value}`).join('; ')}. Visual Style: Flat design, teal and white, minimal icons.`;
          
          // Call the new fallback function with the models from ai_models.js
          aiGeneratedImageUrl = await generateImageWithFallback(visualPrompt, IMAGE_GENERATION_MODELS);
          
          if (aiGeneratedImageUrl.startsWith('Image generation failed')) {
               console.error(aiGeneratedImageUrl); 
          } else {
               console.log("Image generation pipeline successful.");
          }

      } else {
          aiGeneratedImageUrl = "Image generation skipped: Infographic concept failed to parse.";
      }

    } catch (error) {
      console.error("Critical Error in AI Pipeline:", error);
      if (aiGeneratedImageUrl.includes('failed')) aiGeneratedImageUrl = `Critical Image Error: ${error.message}`;
    }

    try {
        console.log(`Updating Firestore document ${storyId}...`);
        await db.collection('stories').doc(storyId).update({
            aiGeneratedWriteup: aiWriteup,
            aiInfographicConcept: aiInfographicConcept,
            aiGeneratedImageUrl: aiGeneratedImageUrl,
            analysisTimestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully updated document ${storyId} with all AI analysis.`);
    } catch (error) {
        console.error(`Error updating Firestore document ${storyId}:`, error);
    }
});

exports.askChatbot = onRequest(
  { 
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 120,
  },
  (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method Not Allowed" });
    }
    // ... (rest of askChatbot is unchanged) ...
  });
});

// ... (rest of the file is unchanged) ...
