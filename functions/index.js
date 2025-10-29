// functions/index.js
const functions = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Define the secret name using the standard practice
const geminiApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket("systemicshiftv2.firebasestorage.app");

// submitStory function remains unchanged
exports.submitStory = functions.https.onRequest({ memory: "1GiB", timeoutSeconds: 120, region: 'asia-southeast1', secrets: [geminiApiKey] }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    let formData = {};
    let fileWrites = [];

    busboy.on("field", (fieldname, val) => {
      console.log(`Processed field ${fieldname}: ${val}.`);
      if (fieldname.endsWith("[]")) {
        const realName = fieldname.replace("[]", "");
        formData[realName] = formData[realName] ? [...formData[realName], val] : [val];
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
        file.on("end", () => writeStream.end());
        writeStream.on("finish", async () => {
          try {
            const uniqueFilename = `${Date.now()}_${filename}`;
            const destination = fieldname === 'writeUp' ? `writeUps/${uniqueFilename}` : `visuals/${uniqueFilename}`;
            const [uploadedFile] = await bucket.upload(filepath, {
              destination: destination,
              metadata: { contentType: mimeType },
            });
            fs.unlinkSync(filepath);
            await uploadedFile.makePublic();
            resolve({ fieldname, url: uploadedFile.publicUrl() });
          } catch (error) {
            console.error("Storage Upload Error:", error);
            fs.unlinkSync(filepath);
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
          writeUpURL,
          visualURLs,
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        ['keyShifts', 'focusAreas', 'desiredMindset'].forEach(field => {
          if (!submissionData[field]) submissionData[field] = [];
        });
        if (submissionData.alignsWithShifts === 'null') submissionData.alignsWithShifts = null;

        await db.collection("stories").add(submissionData);
        res.status(200).send({ message: "Story submitted successfully!" });
      } catch (err) {
        console.error("Firestore/Storage Error:", err);
        res.status(500).send({ error: "Failed to process submission." });
      }
    });

    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  });
});

// --- Firestore Trigger Function for AI Analysis (ENHANCED PROMPTS) ---
exports.analyzeStorySubmission = functions.firestore.onDocumentCreated({document: 'stories/{storyId}', region: 'asia-southeast1', secrets: [geminiApiKey], timeoutSeconds: 300}, async (event) => {
    const storyData = event.data.data();
    const storyId = event.params.storyId;
    console.log(`Analyzing story ID: ${storyId}`);

    // --- Prepare Comprehensive Data for AI ---
    let fullContextText = `--- Story Submission Details ---\n`;
    fullContextText += `Title: ${storyData.storyTitle || storyData.nonShiftTitle || 'N/A'}\n`;
    fullContextText += `Submitter: ${storyData.fullName || 'N/A'}\n`;
    fullContextText += `Division: ${storyData.division || 'N/A'}\n`;
    fullContextText += `Department: ${storyData.department || 'N/A'}\n`;
    fullContextText += `Aligns with Systemic Shifts?: ${storyData.alignsWithShifts || 'N/A'}\n\n`;

    if (storyData.alignsWithShifts === 'yes') {
        fullContextText += `Key Shifts Supported: ${storyData.keyShifts?.join(', ') || 'N/A'}\n`;
        if (storyData.focusAreas?.length > 0) {
            fullContextText += `Focus Areas (Deliver Advantaged Barrels): ${storyData.focusAreas.join(', ') || 'N/A'}\n`;
        }
        fullContextText += `Case for Change / Challenge: ${storyData.caseForChange || 'N/A'}\n`;
        fullContextText += `Desired End State / Solution Implemented: ${storyData.desiredEndState || 'N/A'}\n`;
        fullContextText += `Mindsets Cultivated: ${storyData.desiredMindset?.join(', ') || 'N/A'}\n`;
        fullContextText += `Mindset Explanation: ${storyData.mindsetExplanation || 'N/A'}\n`;
    } else {
        fullContextText += `Story Description: ${storyData.nonShiftDescription || 'N/A'}\n`;
    }
    fullContextText += `Submitted At: ${storyData.submittedAt?.toDate().toISOString() || 'N/A'}\n`;
    fullContextText += `--- End Submission Details ---\n\n`;

    // --- Call Gemini API ---
    let aiWriteup = "AI write-up generation failed.";
    let aiInfographicConcept = "AI infographic concept generation failed.";

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey.value());
        const model = genAI.getGenerativeModel("gemini-1.5-flash");

        // --- Prompt 1: Write-up ---
        const writeupPrompt = `
You are an internal communications writer for PETRONAS Upstream. Your task is to generate a compelling narrative write-up (around 300-500 words) based on the provided story submission details.

**Style Guide:**
* **Tone:** Professional, engaging, and celebratory. Focus on achievements and learnings.
* **Audience:** Internal PETRONAS Upstream employees.
* **Structure:** Follow a structure similar to the provided examples (Decarbonisation, KNNAG, FSV):
    * Start with a hook or impactful statement.
    * Clearly state the challenge or the 'Case for Change'.
    * Describe the solution, action taken, or 'Desired End State' achieved.
    * Highlight key results and quantifiable impacts (e.g., cost savings, efficiency gains, safety records) – make these stand out.
    * Connect the story to relevant Systemic Shifts (Portfolio High-Grading, Deliver Advantaged Barrels, Operate it Right) or desired mindsets (Risk Tolerant, Commercial Savvy, Growth Mindset) if applicable.
    * Conclude with the significance, learnings, or future implications.
* **Keywords:** Use terms like "Systemic Shifts," "Operational Excellence," "Innovation," "Collaboration," "Decarbonisation," "Efficiency," specific PETRONAS entity names if mentioned (PCSB, PMA, etc.).

**Input Data:**
${fullContextText}

**Generate the write-up now.**
`;

        console.log("Generating Write-up...");
        const writeupResult = await model.generateContent(writeupPrompt);
        aiWriteup = writeupResult.response.text().trim(); // Trim whitespace
        console.log("Write-up Generated.");

        // --- Prompt 2: Infographic Concept ---
        const infographicPrompt = `
You are a concept designer for internal communications at PETRONAS Upstream. Analyze the key points of the provided story submission and describe the content and layout plan for a visually engaging infographic, inspired by the style of the Systemic Shifts examples provided (Megah Discovery, FSV Strategy, Kinabalu Drilling, D18 Redevelopment, IAM).

**Style Guide:**
* **Focus:** Visually represent the core achievement and key supporting data. Use strong headings, icons, and clear data callouts.
* **Layout:** Suggest a vertical flow with distinct sections. Consider using elements like timelines, comparison blocks (before/after), key metric highlights, and illustrative icons or simple graphics.
* **Colors:** Recommend using PETRONAS corporate colors (primarily teals, greens, blues) with potential accent colors (like yellow, orange, or purple from the examples) for highlighting key data or sections.
* **Content:** Extract the most impactful information:
    * A catchy, benefit-oriented main title.
    * Brief descriptions for sections (e.g., 'The Challenge', 'Our Approach', 'Key Results', 'The Impact').
    * Specific, quantifiable data points (RM savings, % reduction, days ahead, safety stats) presented clearly (e.g., "RM96 Mil Saved").
    * Relevant Systemic Shifts or Mindsets mentioned.
    * Maybe a key quote if provided or easily synthesized.
* **Output:** Provide ONLY a text description and plan. Do NOT generate an image. Structure your response clearly (e.g., using headings like Title, Sections, Key Metrics, Visual Style, Color Palette).

**Input Data:**
${fullContextText}

**Generate the infographic concept description now.**
`;

        console.log("Generating Infographic Concept...");
        const infographicResult = await model.generateContent(infographicPrompt);
        aiInfographicConcept = infographicResult.response.text().trim(); // Trim whitespace
        console.log("Infographic Concept Generated.");

    } catch (error) {
        console.error("Gemini API error during analysis:", error);
        const errorMessage = error.message || "Unknown AI error";
        aiWriteup = `AI write-up generation failed: ${errorMessage}`;
        aiInfographicConcept = `AI infographic concept generation failed: ${errorMessage}`;
    }

    // --- Update Firestore Document ---
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
