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
const { TEXT_GENERATION_MODELS } = require("./ai_models");

const { defineSecret } = require('firebase-functions/params');
const geminiApiKey = defineSecret('GOOGLE_GENAI_API_KEY');
const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');
// The Hugging Face API key is no longer needed here. 
// It is securely handled by the Python Cloud Function.

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

exports.analyzeStorySubmission = onDocumentCreated(
    { 
        document: 'stories/{storyId}',
        region: 'us-central1', 
        secrets: [geminiApiKey, openRouterApiKey], // <-- Removed huggingFaceApiKey
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
      openrouter: openRouterApiKey.value(),
      // <-- No longer need the Hugging Face key here
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

    const writeupPrompt = `You are an internal communications writer for PETRONAS Upstream... ${fullContextText} ... Generate the write-up now.`;
    const infographicPrompt = `You are a concept designer... ${fullContextText} ... Format your final output as a JSON object with keys "title", "sections", "keyMetrics", "visualStyle", and "colorPalette". Generate the infographic concept (JSON object) now.`;

    let aiWriteup = "AI write-up generation failed.";
    let aiInfographicConcept = { error: "AI infographic concept generation failed." };
    let aiGeneratedImageUrl = "Image generation skipped/failed.";

    // --- Use the new, correct URL for the Python Cloud Function ---
    const HF_WORKER_URL = "https://us-central1-systemicshiftv2.cloudfunctions.net/generate_image_huggingface";

    try {
      const writeupRaw = await generateWithFallback(writeupPrompt, keys, TEXT_GENERATION_MODELS, false);
      aiWriteup = writeupRaw; 

      const infographicRaw = await generateWithFallback(infographicPrompt, keys, TEXT_GENERATION_MODELS, true);
      
      try {
        aiInfographicConcept = JSON.parse(infographicRaw);
      } catch (parseError) {
         console.error("Failed to parse AI JSON response for infographic:", parseError);
         aiInfographicConcept = { error: 'Concept failed to parse.', rawResponse: infographicRaw.substring(0, 500) };
      }
      
      // --- This logic correctly calls the new worker ---
      if (typeof aiInfographicConcept === 'object' && aiInfographicConcept.title) {
          console.log("Attempting to generate image using Python Image Worker...");
          
          const visualPrompt = `Generate a clean, corporate infographic for PETRONAS Upstream. Use a vertical layout. Color palette must be TEAL and GREEN. 
        Title: "${aiInfographicConcept.title}". 
        Key Metrics: ${aiInfographicConcept.keyMetrics.map(m => `${m.label}: ${m.value}`).join('; ')}. 
        Visual Style: Flat design, minimal icons, professional.`;
          
          const response = await fetch(HF_WORKER_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: visualPrompt })
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Python Image worker failed with status ${response.status}. Details: ${errorText}`);
          }

          const workerOutput = await response.json();

          if (workerOutput && workerOutput.status === 'ok' && workerOutput.image_url) {
            aiGeneratedImageUrl = workerOutput.image_url;
            console.log("Python Worker Image Gen Success.");
          } else {
            const errorMessage = workerOutput?.message || "Unknown error from image worker";
            console.error("Python Worker returned an error payload:", JSON.stringify(workerOutput));
            throw new Error(`Image Worker Error: ${errorMessage}`);
          }
      } else {
          aiGeneratedImageUrl = "Image generation skipped: Concept failed to parse.";
      }
    } catch (error) {
      console.error("Critical Error in AI Pipeline:", error);
      if (aiGeneratedImageUrl.includes('failed')) {
          aiGeneratedImageUrl = 'Critical Image Error: ' + error.message;
      }
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
      return res.status(400).send({ error: "Method Not Allowed" });
    }

    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).send({ error: "Message is required." });
      }

      console.log(`Chatbot received message: ${message}`);

      const keys = {
        gemini: geminiApiKey.value(),
        openrouter: openRouterApiKey.value()
      };

      const systemPrompt = `You are a helpful AI assistant for the PETRONAS Upstream "Systemic Shifts" microsite named "Nexus Assistant".
      Answer questions concisely based on the context below and your general knowledge.
      Context: Goal is PETRONAS 2.0 by 2035; Key Shifts are "Portfolio High-Grading" & "Deliver Advantaged Barrels"; Mindsets are "More Risk Tolerant", "Commercial Savvy", "Growth Mindset".

      After providing your answer, suggest 2-3 brief, relevant follow-up questions the user might ask next.
      Format your entire response like this:
      MAIN_ANSWER_TEXT_HERE
      ---
      Suggestions:
      - Follow-up question 1?
      - Follow-up question 2?
      - Follow-up question 3?
      `;

      const fullPrompt = `${systemPrompt}\n\nUSER QUESTION: ${message}\n\nASSISTANT RESPONSE:`;
      
      const aiResponseRaw = await generateWithFallback(fullPrompt, keys, TEXT_GENERATION_MODELS, false);

      let mainReply = aiResponseRaw;
      let suggestions = [];

      const suggestionMarker = "\n---\nSuggestions:";
      const suggestionIndex = aiResponseRaw.indexOf(suggestionMarker);

      if (suggestionIndex !== -1) {
        mainReply = aiResponseRaw.substring(0, suggestionIndex).trim();
        const suggestionLines = aiResponseRaw.substring(suggestionIndex + suggestionMarker.length)
                                          .split('\n')
                                          .map(line => line.trim())
                                          .filter(line => line.startsWith('-'));

        suggestions = suggestionLines.map(line => line.substring(1).trim().replace(/\?$/, ''));
      }

      res.status(200).send({ reply: mainReply, suggestions: suggestions });

    } catch (error) {
      console.error("Error in askChatbot function:", error);
      res.status(500).send({ error: "Sorry, I couldn't process that request." });
    }
  });
});
