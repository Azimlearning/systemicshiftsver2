// functions/index.js

// functions/index.js

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

const { generateWithFallback, extractTextFromFiles, analyzeImageWithAI } = require("./aiHelper");
const { TEXT_GENERATION_MODELS } = require("./ai_models");
const { WriteupRetriever } = require("./rag_writeup_retriever");

// Secrets
const geminiApiKey = defineSecret("GOOGLE_GENAI_API_KEY");
const openRouterApiKey = defineSecret("OPENROUTER_API_KEY");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket("systemicshiftv2.firebasestorage.app");

// ✅ 1. Generate Image Function - wrapped in onRequest
const hfApiKey = defineSecret('HF_API_TOKEN');
const generateImageHfHandler = require('./generate_image_hf').generateImageHf;
exports.generateImageHf = onRequest(
  { 
    region: 'us-central1',
    secrets: [hfApiKey],
    timeoutSeconds: 540,
    memory: '1GiB',
    cpu: 1
  },
  generateImageHfHandler
);

// ✅ 2. Story Submission Function
exports.submitStory = onRequest(
  { region: "us-central1", secrets: [geminiApiKey, openRouterApiKey], timeoutSeconds: 300, memory: "1GiB" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

      const busboy = Busboy({ headers: req.headers });
      const tmpdir = os.tmpdir();
      let formData = {};
      let fileWrites = [];

      busboy.on("field", (fieldname, val) => {
        if (fieldname.endsWith("[]")) {
          const realName = fieldname.replace("[]", "");
          if (formData[realName]) formData[realName].push(val);
          else formData[realName] = [val];
        } else if (fieldname === "acknowledgement") {
          formData[fieldname] = val === "true";
        } else {
          formData[fieldname] = val;
        }
      });

      busboy.on("file", (fieldname, file, filenameDetails) => {
        const { filename, mimeType } = filenameDetails;
        const filepath = path.join(tmpdir, filename);
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
        const promise = new Promise((resolve, reject) => {
          file.on("end", () => writeStream.end());
          writeStream.on("finish", async () => {
            const uniqueFilename = `${Date.now()}_${filename}`;
            const destination = fieldname === "writeUp" ? `writeUps/${uniqueFilename}` : `visuals/${uniqueFilename}`;
            try {
              const [uploadedFile] = await bucket.upload(filepath, { destination, metadata: { contentType: mimeType } });
              if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
              await uploadedFile.makePublic();
              resolve({ fieldname, url: uploadedFile.publicUrl() });
            } catch (error) {
              console.error("Storage Upload Error:", error);
              if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
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
          let writeUpURL = "";
          let visualURLs = [];
          fileResults.forEach(result => {
            if (result.fieldname === "writeUp") writeUpURL = result.url;
            else if (result.fieldname === "visuals") visualURLs.push(result.url);
          });

          const submissionData = {
            ...formData,
            writeUpURL,
            visualURLs,
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          ["keyShifts", "focusAreas", "desiredMindset"].forEach(field => {
            if (!submissionData[field]) submissionData[field] = [];
          });

          if (submissionData.alignsWithShifts === "null") submissionData.alignsWithShifts = null;

          await db.collection("stories").add(submissionData);
          res.status(200).send({ message: "Story submitted successfully!" });
        } catch (err) {
          console.error("Critical Error in submitStory:", err);
          res.status(500).send({ error: `Failed to process submission: ${err.message}` });
        }
      });

      if (req.rawBody) busboy.end(req.rawBody);
      else req.pipe(busboy);
    });
  }
);

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
    console.log(`[analyzeStorySubmission] ===== STARTING ANALYSIS FOR STORY ID: ${storyId} =====`);
    console.log(`[analyzeStorySubmission] Story data keys:`, Object.keys(storyData));

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

    // Build base writeup prompt
    const baseWriteupPrompt = `You are an internal communications writer for PETRONAS Upstream. Your task is to create an engaging, professional write-up for an internal story submission. ${fullContextText} Generate the write-up now.`;

    // Use RAG to enhance prompt with similar writeup examples
    let writeupPrompt = baseWriteupPrompt;
    try {
      const writeupRetriever = new WriteupRetriever();
      const retrievedExamples = writeupRetriever.retrieveExamples(storyData, 2);
      
      if (retrievedExamples && retrievedExamples.length > 0) {
        writeupPrompt = writeupRetriever.enhancePrompt(baseWriteupPrompt, retrievedExamples);
        console.log(`[analyzeStorySubmission] Enhanced writeup prompt with ${retrievedExamples.length} RAG example(s)`);
      } else {
        console.log(`[analyzeStorySubmission] No RAG examples retrieved, using base prompt`);
      }
    } catch (ragError) {
      console.warn(`[analyzeStorySubmission] RAG retrieval failed: ${ragError.message}. Using base prompt.`);
      writeupPrompt = baseWriteupPrompt;
    }
    const infographicPrompt = `You are a concept designer... ${fullContextText} ... Format your final output as a JSON object with keys "title", "sections", "keyMetrics", "visualStyle", and "colorPalette". Generate the infographic concept (JSON object) now.`;

    let aiWriteup = "AI write-up generation failed.";
    let aiInfographicConcept = { error: "AI infographic concept generation failed." };
    let aiGeneratedImageUrl = "Image generation skipped/failed.";

    // --- Use Python Cloud Function for image generation (uses diffusers library) ---
    // Python Cloud Function using diffusers - v2 functions use .run.app domain
    const HF_WORKER_URL = process.env.GENERATE_IMAGE_URL || 'https://generateimagehfpython-el2jwxb5bq-uc.a.run.app';

    try {
      const writeupRaw = await generateWithFallback(writeupPrompt, keys, false);
      aiWriteup = writeupRaw; 

      const infographicRaw = await generateWithFallback(infographicPrompt, keys, true);
      
      // Try to parse JSON, handling markdown code blocks
      let cleanedJson = infographicRaw.trim();
      // Remove markdown code blocks if present
      if (cleanedJson.startsWith('```')) {
        const lines = cleanedJson.split('\n');
        const jsonStart = lines.findIndex(line => line.includes('{'));
        let jsonEnd = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].includes('}')) {
            jsonEnd = i;
            break;
          }
        }
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedJson = lines.slice(jsonStart, jsonEnd + 1).join('\n');
        }
      }
      
      try {
        aiInfographicConcept = JSON.parse(cleanedJson);
      } catch (parseError) {
         console.error("Failed to parse AI JSON response for infographic:", parseError);
         console.error("Raw response:", infographicRaw.substring(0, 1000));
         
         // Try to extract title from raw response as fallback
         const titleMatch = infographicRaw.match(/"title"\s*:\s*"([^"]+)"/i) || 
                           infographicRaw.match(/title["\s:]+([^",}\n]+)/i);
         const extractedTitle = titleMatch ? titleMatch[1].trim() : null;
         
         aiInfographicConcept = { 
           error: 'Concept failed to parse.', 
           rawResponse: infographicRaw.substring(0, 500),
           title: extractedTitle || storyData.storyTitle || storyData.nonShiftTitle || 'Systemic Shift Story'
         };
      }
      
      // --- Image generation is handled by local service ---
      // The local_image_generator.py service monitors Firestore and generates images locally
      // So we just mark that the concept is ready for image generation
      console.log(`[analyzeStorySubmission] aiInfographicConcept type: ${typeof aiInfographicConcept}, has title: ${!!aiInfographicConcept?.title}, title value: ${aiInfographicConcept?.title}`);
      
      if (typeof aiInfographicConcept === 'object' && aiInfographicConcept.title) {
          console.log("[analyzeStorySubmission] Infographic concept ready. Local image generator service will process it.");
          // Don't set aiGeneratedImageUrl here - let the local service handle it
          // This allows the local service to generate images asynchronously
          aiGeneratedImageUrl = "Pending local generation";
      } else {
          const reason = !aiInfographicConcept ? 'aiInfographicConcept is null/undefined' :
                        typeof aiInfographicConcept !== 'object' ? `aiInfographicConcept is not an object (type: ${typeof aiInfographicConcept})` :
                        !aiInfographicConcept.title ? 'aiInfographicConcept has no title property' :
                        'Unknown reason';
          console.log(`[analyzeStorySubmission] Image generation skipped. Reason: ${reason}`);
          console.log(`[analyzeStorySubmission] aiInfographicConcept value:`, JSON.stringify(aiInfographicConcept).substring(0, 500));
          aiGeneratedImageUrl = `Image generation skipped: ${reason}`;
      }
    } catch (error) {
      console.error("Critical Error in AI Pipeline:", error);
      console.error("Error stack:", error.stack);
      // Always set error message, don't check if it includes 'failed'
      aiGeneratedImageUrl = 'Critical Image Error: ' + error.message;
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

// Manual trigger function to test image generation for existing documents
exports.triggerImageGeneration = onRequest(
  {
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 600,
    memory: '1GiB',
  },
  async (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed. Use POST." });
      }

      try {
        const { storyId } = req.body;
        if (!storyId) {
          return res.status(400).json({ error: "storyId is required in request body" });
        }

        console.log(`[triggerImageGeneration] Manual trigger for storyId: ${storyId}`);

        // Get the document from Firestore
        const docRef = db.collection('stories').doc(storyId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          return res.status(404).json({ error: `Document ${storyId} not found` });
        }

        const storyData = docSnap.data();
        console.log(`[triggerImageGeneration] Found document with title: ${storyData.nonShiftTitle || storyData.storyTitle || 'N/A'}`);

        // Check if analysis already exists
        if (storyData.aiGeneratedWriteup) {
          console.log(`[triggerImageGeneration] Document already has AI analysis. Regenerating image only...`);
        }

        // Extract title for image generation
        const title = storyData.nonShiftTitle || storyData.storyTitle || 'Systemic Shift Story';
        
        // Get or create infographic concept
        let aiInfographicConcept = storyData.aiInfographicConcept;
        if (!aiInfographicConcept || !aiInfographicConcept.title) {
          // Generate concept if it doesn't exist
          console.log(`[triggerImageGeneration] Generating infographic concept...`);
          const keys = {
            gemini: geminiApiKey.value(),
            openrouter: openRouterApiKey.value(),
          };

          const conceptPrompt = `Generate a concise JSON infographic concept for this story:
Title: ${title}
Description: ${(storyData.nonShiftDescription || storyData.storyDescription || '').substring(0, 500)}

Return JSON with: {"title": "...", "keyMetrics": [{"label": "...", "value": "..."}]}`;

          const conceptRaw = await generateWithFallback(conceptPrompt, keys, false);
          
          try {
            let cleanedJson = conceptRaw.trim();
            if (cleanedJson.startsWith('```')) {
              const lines = cleanedJson.split('\n');
              const jsonStart = lines.findIndex(line => line.includes('{'));
              let jsonEnd = -1;
              for (let i = lines.length - 1; i >= 0; i--) {
                if (lines[i].includes('}')) {
                  jsonEnd = i;
                  break;
                }
              }
              if (jsonStart !== -1 && jsonEnd !== -1) {
                cleanedJson = lines.slice(jsonStart, jsonEnd + 1).join('\n');
              }
            }
            aiInfographicConcept = JSON.parse(cleanedJson);
          } catch (parseError) {
            aiInfographicConcept = {
              error: 'Concept failed to parse.',
              title: title
            };
          }
        }

        // Image generation is handled by local Python service (local_image_generator.py)
        // Just update Firestore with the concept - the local service will detect it and generate the image
        console.log(`[triggerImageGeneration] Updating Firestore with concept. Local service will generate image.`);
        
        // Update document with concept - local service will handle image generation
        await docRef.update({
          aiInfographicConcept: aiInfographicConcept,
          aiGeneratedImageUrl: "Pending local generation",
          analysisTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`[triggerImageGeneration] Successfully updated document ${storyId} with concept. Local service will generate image.`);

        return res.status(200).json({
          success: true,
          storyId: storyId,
          message: 'Concept generated and document updated. Local image generator service will process the image generation.',
          aiInfographicConcept: aiInfographicConcept
        });

      } catch (error) {
        console.error("[triggerImageGeneration] Error:", error);
        return res.status(500).json({
          error: "Failed to trigger image generation",
          message: error.message,
          stack: error.stack
        });
      }
    });
  }
);

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

// ✅ 5. Analyze Image Function - AI auto-tagging and categorization
exports.analyzeImage = onRequest(
  {
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 120,
    memory: '1GiB',
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
      }

      try {
        const { imageUrl } = req.body;

        if (!imageUrl || typeof imageUrl !== 'string') {
          return res.status(400).send({ error: "imageUrl (string) is required." });
        }

        console.log(`[analyzeImage] Analyzing image: ${imageUrl.substring(0, 100)}...`);

        const keys = {
          gemini: geminiApiKey.value(),
          openrouter: openRouterApiKey.value()
        };

        const analysisResult = await analyzeImageWithAI(imageUrl, keys);

        console.log(`[analyzeImage] Analysis successful:`, {
          category: analysisResult.category,
          tagsCount: analysisResult.tags.length
        });

        res.status(200).send({
          success: true,
          tags: analysisResult.tags,
          category: analysisResult.category,
          description: analysisResult.description
        });

      } catch (error) {
        console.error("[analyzeImage] Error:", error);
        const errorMessage = error.message || "Unknown error occurred";
        const errorDetails = error.stack ? error.stack.substring(0, 500) : '';
        
        // Check if it's an OpenRouter authentication error
        if (errorMessage.includes('401') || errorMessage.includes('User not found')) {
          return res.status(500).send({
            error: "OpenRouter API authentication failed",
            message: "The OpenRouter API key is invalid or expired. Please check your API key configuration.",
            details: "OpenRouter returned: User not found (401)"
          });
        }
        
        res.status(500).send({
          error: "Failed to analyze image",
          message: errorMessage,
          details: errorDetails
        });
      }
    });
  }
);

// ✅ 7. Generate Podcast Function
const { createGeneratePodcastHandler } = require('./generatePodcast');
exports.generatePodcast = onRequest(
  {
    region: 'us-central1',
    secrets: [geminiApiKey, openRouterApiKey],
    timeoutSeconds: 300,
    memory: '1GiB',
  },
  createGeneratePodcastHandler(geminiApiKey, openRouterApiKey)
);
