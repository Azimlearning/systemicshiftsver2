
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

// --- Import from our helper file ---
const { generateWithFallback, extractTextFromFiles } = require("./aiHelper");

// --- Define Secrets ---
const { defineSecret } = require('firebase-functions/params');
const geminiApiKey = defineSecret('GOOGLE_GENAI_API_KEY'); 
const openRouterApiKey = defineSecret('OPENROUTER_API_KEY');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// --- CORRECTED BUCKET NAME ---
// This name must be consistent with the one used in aiHelper.js
const bucket = storage.bucket("systemicshiftv2.firebasestorage.app"); 

// -----------------------------------------------------------------
// --- submitStory Function (V2 Syntax) ---
// -----------------------------------------------------------------
exports.submitStory = onRequest(
  { 
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 300, 
    memory: '1GiB',
    // environmentVariables: { DEPLOY_VERSION: "v3" } // This line was causing issues, removing it
  },
  (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    console.log("Function started: submitStory (V2)");

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
        console.log(`Processed file ${filename} (${fieldname})`);
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
        console.log("Waiting for file uploads...");
        const fileResults = await Promise.all(fileWrites);
        console.log("File uploads finished.");
        let writeUpURL = '';
        let visualURLs = [];
        fileResults.forEach(result => {
          if (result.fieldname === 'writeUp') writeUpURL = result.url;
          else if (result.fieldname === 'visuals') visualURLs.push(result.url);
        });

        console.log("Saving raw data to Firestore...");
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
        console.log("Successfully saved to Firestore.");
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

// -----------------------------------------------------------------
// --- analyzeStorySubmission Function (V2 Syntax, uses aiHelper.js) ---
// -----------------------------------------------------------------
exports.analyzeStorySubmission = onDocumentCreated(
    { 
        document: 'stories/{storyId}',
        region: 'us-central1', 
        secrets: [geminiApiKey, openRouterApiKey],
        timeoutSeconds: 540, 
        memory: '1GiB',
        // environmentVariables: { DEPLOY_VERSION: "v3" }
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
    if (extractedFileText) {
      console.log(`Successfully extracted ${extractedFileText.length} characters from file.`);
    }

    let fullContextText = `--- Story Submission Details ---\n`;
    fullContextText += `Title: ${storyData.storyTitle || storyData.nonShiftTitle || 'N/A'}\n`;
    fullContextText += `Submitter: ${storyData.fullName || 'N/A'}\n`;
    fullContextText += `Aligns with Systemic Shifts?: ${storyData.alignsWithShifts || 'N/A'}\n\n`;
    if (storyData.alignsWithShifts === 'yes') {
        fullContextText += `Key Shifts Supported: ${storyData.keyShifts?.join(', ') || 'N/A'}\n`;
        if (storyData.focusAreas?.length > 0) {
            fullContextText += `Focus Areas: ${storyData.focusAreas.join(', ') || 'N/A'}\n`;
        }
        fullContextText += `Case for Change: ${storyData.caseForChange || 'N/A'}\n`;
        fullContextText += `Desired End State: ${storyData.desiredEndState || 'N/A'}\n`;
        fullContextText += `Mindsets Cultivated: ${storyData.desiredMindset?.join(', ') || 'N/A'}\n`;
    } else {
        fullContextText += `Story Description: ${storyData.nonShiftDescription || 'N/A'}\n`;
    }
    if (extractedFileText) {
      fullContextText += `\n--- Extracted Text from Uploaded Document ---\n${extractedFileText}\n--- End Extracted Text ---\n`;
    }
    fullContextText += `--- End Submission Details ---\n\n`;

    const writeupPrompt = `
You are an internal communications writer for PETRONAS Upstream. Your task is to generate a compelling narrative write-up (around 300-500 words) based on the provided story submission details (which includes form fields AND text extracted from an uploaded document).
**Style Guide:**
* **Tone:** Professional, engaging, and celebratory. Focus on achievements and learnings.
* **Structure:** Follow a structure similar to the provided examples (Decarbonisation, KNNAG, FSV):
    * Start with a hook or impactful statement.
    * Clearly state the challenge or the 'Case for Change'.
    * Describe the solution, action taken, or 'Desired End State' achieved.
    * Highlight key results and quantifiable impacts (e.Read more: g., cost savings, efficiency gains, safety records) – make these stand out.
    * Connect the story to relevant Systemic Shifts (Portfolio High-Grading, Deliver Advantaged Barrels, Operate it Right) or desired mindsets (Risk Tolerant, Commercial Savvy, Growth Mindset) if applicable.
    * Conclude with the significance, learnings, or future implications.
* **Input Data:**
${fullContextText}
**Generate the write-up now.**
`;
    const infographicPrompt = `
You are a concept designer for internal communications at PETRONAS Upstream. Analyze the key points of the provided story submission and describe the content and layout plan for a visually engaging infographic, inspired by the style of the Systemic Shifts examples provided (Megah Discovery, FSV Strategy, Kinabalu Drilling, D18 Redevelopment, IAM).
**Style Guide:**
* **Focus:** Visually represent the core achievement and key supporting data. Use strong headings, icons, and clear data callouts.
* **Layout:** Suggest a vertical flow with distinct sections.
* **Content:** Extract the most impactful information:
    * A catchy, benefit-oriented main title.
    * Brief descriptions for sections (e.g., 'The Challenge', 'Our Approach', 'Key Results').
    * Specific, quantifiable data points (RM savings, % reduction, days ahead, safety stats) presented clearly (e.g., "RM96 Mil Saved").
    * Relevant Systemic Shifts or Mindsets mentioned.
* **Output:** Provide ONLY a text description and plan, formatted as a JSON object with keys "title", "sections" (array of {title, content}), "keyMetrics" (array of {label, value}), "visualStyle", and "colorPalette".
**Input Data:**
${fullContextText}
**Generate the infographic concept (JSON object) now.**
`;

    let aiWriteup = "AI write-up generation failed.";
    let aiInfographicConcept = { error: "AI infographic concept generation failed." };

    try {
      aiWriteup = await generateWithFallback(writeupPrompt, keys, false);
      const infographicRaw = await generateWithFallback(infographicPrompt, keys, true);
      
      try {
        aiInfographicConcept = JSON.parse(infographicRaw);
      } catch (parseError) {
         console.error("Failed to parse AI JSON response for infographic:", parseError, "Raw text:", infographicRaw);
         aiInfographicConcept = { error: 'AI analysis failed to parse.', rawResponse: infographicRaw };
      }

    } catch (error) {
        console.error("Gemini/OpenRouter API error during analysis:", error);
        const errorMessage = error.message || "Unknown AI error";
        if (aiWriteup.includes('failed')) aiWriteup = `AI write-up generation failed: ${errorMessage}`;
        aiInfographicConcept = { error: `AI infographic concept generation failed: ${errorMessage}`};
    }

    try {
        console.log(`Updating Firestore document ${storyId}...`);
        await db.collection('stories').doc(storyId).update({
            aiGeneratedWriteup: aiWriteup,
            aiInfographicConcept: aiInfographicConcept,
            analysisTimestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully updated document ${storyId} with AI analysis.`);
    } catch (error) {
        console.error(`Error updating Firestore document ${storyId}:`, error);
    }
});

// -----------------------------------------------------------------
// --- NEW: Chatbot Function ---
// -----------------------------------------------------------------
exports.askChatbot = onRequest(
  {
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 120
  },
  (req, res) => {
    // Use CORS middleware
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

        const systemPrompt = `You are a helpful AI assistant for the PETRONAS Upstream "Systemic Shifts" microsite.
        Your name is "Nexus Assistant".
        You can answer questions about PETRONAS, Systemic Shifts, Upstream Targets, Key Shifts, and Mindsets.
        Be concise, helpful, and professional.
        
        Here is some context (which you can add to later):
        - The goal is PETRONAS 2.0 by 2035.
        - Key Shifts include "Portfolio High-Grading" and "Deliver Advantaged Barrels".
        - Desired Mindsets are "More Risk Tolerant", "Commercial Savvy", and "Growth Mindset".

        The user is asking a question. Answer it based on this context and your general knowledge.
        `;
        
        const fullPrompt = `${systemPrompt}\n\nUSER QUESTION: ${message}\n\nASSISTANT ANSWER:`;

        const aiResponse = await generateWithFallback(fullPrompt, keys, false);

        res.status(200).send({ reply: aiResponse });

      } catch (error) {
        console.error("Error in askChatbot function:", error);
        res.status(500).send({ error: "Sorry, I couldn't process that request." });
      }
    });
  }
);
