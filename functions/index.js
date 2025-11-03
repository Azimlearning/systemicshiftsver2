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

// --- UPDATED IMPORTS ---
const { generateWithFallback, extractTextFromFiles, generateImage } = require("./aiHelper");
const { TEXT_GENERATION_MODELS } = require("./ai_models"); // Import the new models file
// --- END UPDATED IMPORTS ---

const { defineSecret } = require('firebase-functions/params');
const geminiApiKey = defineSecret('GOOGLE_GENAI_API_KEY'); 
const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const bucket = storage.bucket("systemicshiftv2.firebasestorage.app"); 

/**
 * Attempts to parse a JSON object from a string that may contain extra text.
 * Returns null if parsing fails.
 */
function tryParseJsonObject(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return null;
  }

  const normalized = rawText
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, "\"")
    .trim();

  try {
    return JSON.parse(normalized);
  } catch (error) {
    // ignore, try extracting substring
  }

  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = normalized.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (err) {
      return null;
    }
  }

  return null;
}

/**
 * Ensures the infographic concept string is valid JSON, optionally repairing via another AI call.
 */
async function getInfographicConceptFromRaw(rawText, keys) {
  const initialParse = tryParseJsonObject(rawText);
  if (initialParse) {
    return initialParse;
  }

  console.warn("Infographic concept JSON parse failed, attempting repair.");
  const repairPrompt = `The following text was meant to be a JSON object that matches this schema:
{
  "title": string,
  "tagline"?: string,
  "overall_design_concept"?: {
    "visual_metaphor"?: string,
    "layout"?: string,
    "color_palette"?: string,
    "imagery"?: string,
    "typography"?: string
  },
  "sections": Array<{"title": string, "content": string}> ,
  "keyMetrics"?: Array<{"label": string, "value": string}>,
  "visualStyle"?: object,
  "colorPalette"?: object
}

Convert the text below into a valid JSON object that strictly matches the schema. Return ONLY the JSON object with double quotes and no additional explanation.

---
${rawText}
---`;

  try {
    const repairedRaw = await generateWithFallback(repairPrompt, keys, true);
    const repairedParse = tryParseJsonObject(repairedRaw);
    if (repairedParse) {
      return repairedParse;
    }
  } catch (repairError) {
    console.warn("Infographic concept repair attempt failed:", repairError.message);
  }

  return null;
}

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

    const writeupPrompt = `You are an internal communications writer for PETRONAS Upstream. Your task is to create a compelling, professional write-up for internal communications that highlights the systemic shift initiative described below.

${fullContextText}

Guidelines for the write-up:
- Use a professional, engaging tone suitable for corporate internal communications
- Highlight the key achievements, impacts, and value delivered
- Connect the initiative to PETRONAS 2.0 vision and the Systemic Shifts framework
- Include specific metrics and outcomes when available
- Keep it concise but informative (approximately 300-500 words)
- Use clear headings and bullet points for readability

Generate the write-up now.`;

    // Enhanced infographic prompt with style references from examples
    const infographicStyleGuide = `Based on PETRONAS Upstream corporate infographic examples, follow these style guidelines:
- Layout: Vertical layout with sections stacked from top to bottom
- Color Palette: Primary Teal (#00A896 or similar), White backgrounds (#FFFFFF), Light Gray accents (#F5F5F5 or #E0E0E0), Dark Gray/Black text (#333333 or #1A1A1A)
- Typography: Bold sans-serif for headings (Montserrat, Poppins), legible sans-serif for body (Lato, Open Sans)
- Visual Elements: Modern minimal flat icons, clean professional illustrations, large bold metrics/numbers
- Composition: Clear section breaks, generous white space, centered or left-aligned text blocks, large bold statistics`;

    const infographicPrompt = `You are a concept designer for PETRONAS Upstream internal communications. Create a detailed infographic concept based on the following story submission:

${fullContextText}

${infographicStyleGuide}

Your task is to design a concept for an infographic that will be generated. Format your response as a JSON object with the following structure:
{
  "title": "Short, impactful title (max 10 words)",
  "sections": [
    {"title": "Section title", "content": "Brief description of section content"},
    ...
  ],
  "keyMetrics": [
    {"label": "Metric name", "value": "Metric value or description"},
    ...
  ],
  "visualStyle": {
    "typography": "Description of typography choices",
    "imagery": "Description of icon/illustration style",
    "layout": "Vertical layout with sections"
  },
  "colorPalette": {
    "primary": "#00A896 or similar teal",
    "secondary": "#FFFFFF",
    "accent": "#F5F5F5",
    "text": "#333333"
  }
}

Generate the infographic concept (JSON object) now. Ensure the JSON is valid and complete.`;

    let aiWriteup = "AI write-up generation failed.";
    let aiInfographicConcept = { error: "AI infographic concept generation failed." };
    let aiGeneratedImageUrl = "Image generation skipped/failed.";

    try {
      const writeupRaw = await generateWithFallback(writeupPrompt, keys, false);
      aiWriteup = writeupRaw; 

      const infographicRaw = await generateWithFallback(infographicPrompt, keys, true);

      const parsedConcept = await getInfographicConceptFromRaw(infographicRaw, keys);
      if (parsedConcept) {
        aiInfographicConcept = parsedConcept;
      } else {
        aiInfographicConcept = { error: "Concept failed to parse.", rawResponse: infographicRaw.substring(0, 500) };
      }

      if (typeof aiInfographicConcept === 'object' && aiInfographicConcept.title) {
        console.log("Attempting to generate image from structured concept...");
        aiGeneratedImageUrl = await generateImage(aiInfographicConcept, keys);
      } else {
        aiGeneratedImageUrl = "Image generation skipped: Concept failed to parse.";
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

      // Use dynamic import for node-fetch
      const fetch = (await import('node-fetch')).default;

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
      
      const aiResponseRaw = await generateWithFallback(fullPrompt, keys, false);

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
