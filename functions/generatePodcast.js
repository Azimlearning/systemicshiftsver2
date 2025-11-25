// functions/generatePodcast.js

const { generateWithFallback } = require("./aiHelper");
const { generatePodcastAudio } = require("./podcastTTS");
const { ChatbotRAGRetriever } = require("./chatbotRAGRetriever");
const { sanitizePromptInput, detectPromptInjection, buildSecurityNotice } = require("./promptSecurity");

/**
 * Generates a podcast script based on a topic and optional context.
 * Uses AI to create a structured podcast with outline, script, and sections.
 * 
 * @param {Object} geminiApiKey - Secret object for Gemini API key
 * @param {Object} openRouterApiKey - Secret object for OpenRouter API key
 * @returns {Function} Handler function for the Cloud Function
 */
function createGeneratePodcastHandler(geminiApiKey, openRouterApiKey) {
  return async (req, res) => {
    const cors = require("cors")({ origin: true });
    
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
      }

      try {
        const { topic, context } = req.body;

        if (!topic || typeof topic !== 'string' || !topic.trim()) {
          return res.status(400).send({ error: "topic (string) is required." });
        }

        const sanitizedTopic = sanitizePromptInput(topic, 500);
        if (!sanitizedTopic) {
          return res.status(400).send({ error: "topic (string) is required." });
        }
        const sanitizedContext = context ? sanitizePromptInput(context, 2000) : '';
        const injectionSignals = [
          ...detectPromptInjection(topic),
          ...(context ? detectPromptInjection(context) : [])
        ];
        if (injectionSignals.length) {
          console.warn(`[generatePodcast] Potential prompt injection detected: ${injectionSignals.join(', ')}`);
        }
        const securityNotice = buildSecurityNotice(injectionSignals);
        const requestId = createRequestId('pod');
        const logPrefix = `[generatePodcast][${requestId}]`;

        const keys = {
          gemini: geminiApiKey.value(),
          openrouter: openRouterApiKey.value()
        };

      if (!keys.gemini && !keys.openrouter) {
        return res.status(500).send({ error: "AI API keys not configured." });
      }

        console.log(`${logPrefix} Generating podcast for topic: ${sanitizedTopic.substring(0, 100)}`);

      // Use RAG to retrieve relevant knowledge base documents
      let knowledgeContext = '';
      let retrievedDocs = [];
      let ragUsed = false;
      let ragMetadata = {
        query: '',
        documentsFound: 0,
        topDocuments: [],
        contextLength: 0,
        error: null
      };

      try {
        // Build query from topic and context
        const ragQuery = sanitizedContext
          ? `${sanitizedTopic}. ${sanitizedContext}`.trim()
          : sanitizedTopic.trim();
        
        ragMetadata.query = ragQuery;
        console.log(`${logPrefix} ===== RAG RETRIEVAL START =====`);
        console.log(`${logPrefix} Query: "${ragQuery}" (${ragQuery.length} chars)`);
        
        const ragRetriever = new ChatbotRAGRetriever();
        console.log(`${logPrefix} Initialized ChatbotRAGRetriever`);
        console.log(`${logPrefix} Calling retrieveRelevantDocuments with topK=5...`);
        const ragStart = Date.now();
        
        retrievedDocs = await ragRetriever.retrieveRelevantDocuments(
          ragQuery,
          keys,
          5,
          null,
          {
            queryType: 'podcast'
          }
        ); // Get top 5 documents
        
        console.log(`${logPrefix} retrieveRelevantDocuments returned ${retrievedDocs ? retrievedDocs.length : 0} documents in ${Date.now() - ragStart} ms`);
        
        if (retrievedDocs && retrievedDocs.length > 0) {
          console.log(`${logPrefix} Processing ${retrievedDocs.length} retrieved documents...`);
          
          // Log each document found
          retrievedDocs.forEach((doc, idx) => {
            console.log(`${logPrefix} Document ${idx + 1}: "${doc.title}" (similarity: ${doc.similarity?.toFixed(4) || 'N/A'}, category: ${doc.category || 'N/A'})`);
            console.log(`${logPrefix}   Content preview: ${doc.content?.substring(0, 100) || 'No content'}...`);
          });
          
          knowledgeContext = ragRetriever.buildContextString(retrievedDocs, { maxTokens: 1200 }); // Keep within token budget
          ragUsed = true;
          
          ragMetadata.documentsFound = retrievedDocs.length;
          ragMetadata.topDocuments = retrievedDocs.slice(0, 3).map(doc => ({
            title: doc.title,
            similarity: doc.similarity,
            category: doc.category,
            sourceUrl: doc.sourceUrl
          }));
          ragMetadata.contextLength = knowledgeContext.length;
          
          console.log(`${logPrefix} Built context string: ${knowledgeContext.length} characters`);
          console.log(`${logPrefix} Context preview (first 200 chars): ${knowledgeContext.substring(0, 200)}...`);
          console.log(`${logPrefix} Top match: "${retrievedDocs[0].title}" (similarity: ${retrievedDocs[0].similarity?.toFixed(4) || 'N/A'})`);
        } else {
          console.log(`${logPrefix} ⚠️  No relevant documents found in knowledge base`);
          console.log(`${logPrefix} Possible reasons: 1) KB empty 2) No embeddings 3) Query similarity low`);
          console.log(`${logPrefix} Using static context only`);
          ragMetadata.documentsFound = 0;
        }
        
        console.log(`${logPrefix} ===== RAG RETRIEVAL END =====`);
      } catch (ragError) {
        console.error(`${logPrefix} ❌ RAG retrieval failed: ${ragError.message}`);
        console.error(`${logPrefix} RAG error stack:`, ragError.stack);
        ragMetadata.error = ragError.message;
        // Continue without RAG - use static context as fallback
      }

      // Build the podcast generation prompt
      const systemicShiftsContext = `
PETRONAS Upstream is undergoing a transformation through "Systemic Shifts" - strategic changes in mindset, behavior, and operations to achieve PETRONAS 2.0 vision. Key areas include:
- Operational Excellence (Systemic Shift #8: Operate it Right)
- Digital Transformation
- Sustainability and Decarbonisation
- Innovation and Technology
- People and Culture
- Safety and Risk Management
`;

      // Build prompt with RAG context prioritized
      const knowledgeSection = knowledgeContext
        ? `### Knowledge Base (Primary Facts)\n${knowledgeContext}`
        : '### Knowledge Base (Primary Facts)\nNo relevant knowledge base passages were retrieved. Lean on the systemic context below.';

      const userContextSection = sanitizedContext
        ? `### Additional Context From Requestor\n${sanitizedContext}`
        : '';

      const examplePodcastJson = `{
  "outline": "Intro → Theme → Case Study → Conclusion",
  "script": "HOST: Welcome back...\\nGUEST: Thanks for having me...",
  "sections": [
    {
      "title": "Setting the Stage",
      "content": "HOST and GUEST discuss the shift objectives...",
      "qa": [
        {
          "question": "HOST: Why does this shift matter now?",
          "answer": "GUEST: It unlocks advantaged barrels by..."
        }
      ]
    }
  ]
}`;

      const promptSections = [
        `### Role
You are creating an educational podcast script for PETRONAS Upstream employees about "${sanitizedTopic}". Maintain an engaging, professional tone suitable for internal communications.`,
        knowledgeSection,
        `### Systemic Shifts Overview
${systemicShiftsContext}`,
        userContextSection,
        securityNotice ? `### Security Notice\n${securityNotice}` : '',
        `### Output Requirements
1. Provide an "outline" summarizing the episode.
2. Provide a conversational "script" with HOST:/GUEST: markers.
3. Provide "sections" (3-5) each with title, content, and 2-3 Q&A pairs.
4. Keep runtime near 12-15 minutes; highlight practical examples and PETRONAS references.`,
        `### Example JSON Structure
${examplePodcastJson}`,
        `### Response Format
Return strict JSON following the structure shown above.`
      ].filter(Boolean);

      const podcastPrompt = promptSections.join('\n\n');

      // Log prompt details for debugging
      console.log(`${logPrefix} ===== PROMPT DETAILS =====`);
      console.log(`${logPrefix} Prompt length: ${podcastPrompt.length} characters`);
      console.log(`${logPrefix} RAG context included: ${knowledgeContext ? 'YES' : 'NO'}`);
      if (knowledgeContext) {
        console.log(`${logPrefix} RAG context length: ${knowledgeContext.length} characters`);
      }
      console.log(`${logPrefix} Prompt preview (first 500 chars): ${podcastPrompt.substring(0, 500)}...`);
      console.log(`${logPrefix} ===== END PROMPT DETAILS =====`);

      // Generate podcast content
      console.log(`${logPrefix} Calling generateWithFallback to generate podcast...`);
      const llmStart = Date.now();
      const podcastJson = await generateWithFallback(podcastPrompt, keys, true);
      console.log(`${logPrefix} Received response from LLM (${podcastJson.length} characters) in ${Date.now() - llmStart} ms`);

      // Parse the JSON response
      let podcastData;
      try {
        // Clean up the response (remove markdown code blocks if present)
        let cleanedJson = podcastJson.trim();
        cleanedJson = cleanedJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        podcastData = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error(`${logPrefix} JSON parse error:`, parseError);
        // If JSON parsing fails, create a structured response from the text
        podcastData = {
          outline: "Podcast outline generated",
          script: podcastJson,
          sections: [
            {
              title: "Main Discussion",
              content: podcastJson,
              qa: []
            }
          ]
        };
      }

      // Ensure required fields exist
      if (!podcastData.outline) podcastData.outline = "Podcast outline";
      if (!podcastData.script) podcastData.script = podcastJson;
      if (!podcastData.sections || !Array.isArray(podcastData.sections)) {
        podcastData.sections = [{
          title: "Main Discussion",
          content: podcastData.script,
          qa: []
        }];
      }

      console.log(`${logPrefix} Successfully generated podcast with ${podcastData.sections.length} sections`);

      // Generate audio from the script
      let audioUrl = null;
      if (podcastData.script) {
        try {
          console.log(`${logPrefix} Starting audio generation...`);
          console.log(`${logPrefix} Script length: ${podcastData.script.length} characters`);
          audioUrl = await generatePodcastAudio(podcastData.script, topic.trim());
          console.log(`${logPrefix} Audio generated successfully: ${audioUrl}`);
        } catch (audioError) {
          console.error(`${logPrefix} Audio generation failed:`, audioError);
          console.error(`${logPrefix} Audio error stack:`, audioError.stack);
          // Continue without audio - script generation was successful
          // Audio generation failure should not fail the entire request
          // But log the error for debugging
        }
      } else {
        console.warn('[generatePodcast] No script available for audio generation');
      }

      // Prepare response with RAG metadata for debugging
      const response = {
        success: true,
        podcast: podcastData,
        topic: sanitizedTopic,
        audioUrl: audioUrl,
        ragMetadata: {
          used: ragUsed,
          documentsFound: ragMetadata.documentsFound,
          topDocuments: ragMetadata.topDocuments,
          query: ragMetadata.query,
          contextLength: ragMetadata.contextLength,
          error: ragMetadata.error
        }
      };

      console.log(`${logPrefix} ===== RESPONSE SUMMARY =====`);
      console.log(`${logPrefix} RAG used: ${ragUsed}`);
      console.log(`${logPrefix} Documents found: ${ragMetadata.documentsFound}`);
      console.log(`${logPrefix} Context length: ${ragMetadata.contextLength} chars`);
      if (ragMetadata.topDocuments.length > 0) {
        console.log(`${logPrefix} Top documents: ${ragMetadata.topDocuments.map(d => d.title).join(', ')}`);
      }
      console.log(`${logPrefix} ===== END RESPONSE SUMMARY =====`);

      res.status(200).send(response);

      } catch (error) {
        console.error(`${logPrefix} Error:`, error);
        res.status(500).send({
          error: "Failed to generate podcast",
          message: error.message
        });
      }
    });
  };
}

module.exports = { createGeneratePodcastHandler };

