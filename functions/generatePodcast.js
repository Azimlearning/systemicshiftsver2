// functions/generatePodcast.js

const { generateWithFallback } = require("./aiHelper");
const { generatePodcastAudio } = require("./podcastTTS");
const { ChatbotRAGRetriever } = require("./chatbotRAGRetriever");

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

        const keys = {
          gemini: geminiApiKey.value(),
          openrouter: openRouterApiKey.value()
        };

      if (!keys.gemini && !keys.openrouter) {
        return res.status(500).send({ error: "AI API keys not configured." });
      }

      console.log(`[generatePodcast] Generating podcast for topic: ${topic.substring(0, 100)}`);

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
        const ragQuery = context 
          ? `${topic}. ${context}`.trim()
          : topic.trim();
        
        ragMetadata.query = ragQuery;
        console.log(`[generatePodcast] ===== RAG RETRIEVAL START =====`);
        console.log(`[generatePodcast] Query: "${ragQuery}"`);
        console.log(`[generatePodcast] Query length: ${ragQuery.length} characters`);
        
        const ragRetriever = new ChatbotRAGRetriever();
        console.log(`[generatePodcast] Initialized ChatbotRAGRetriever`);
        console.log(`[generatePodcast] Calling retrieveRelevantDocuments with topK=5...`);
        
        retrievedDocs = await ragRetriever.retrieveRelevantDocuments(ragQuery, keys, 5); // Get top 5 documents
        
        console.log(`[generatePodcast] retrieveRelevantDocuments returned ${retrievedDocs ? retrievedDocs.length : 0} documents`);
        
        if (retrievedDocs && retrievedDocs.length > 0) {
          console.log(`[generatePodcast] Processing ${retrievedDocs.length} retrieved documents...`);
          
          // Log each document found
          retrievedDocs.forEach((doc, idx) => {
            console.log(`[generatePodcast] Document ${idx + 1}: "${doc.title}" (similarity: ${doc.similarity?.toFixed(4) || 'N/A'}, category: ${doc.category || 'N/A'})`);
            console.log(`[generatePodcast]   Content preview: ${doc.content?.substring(0, 100) || 'No content'}...`);
          });
          
          knowledgeContext = ragRetriever.buildContextString(retrievedDocs, 3000); // Max 3000 chars
          ragUsed = true;
          
          ragMetadata.documentsFound = retrievedDocs.length;
          ragMetadata.topDocuments = retrievedDocs.slice(0, 3).map(doc => ({
            title: doc.title,
            similarity: doc.similarity,
            category: doc.category,
            sourceUrl: doc.sourceUrl
          }));
          ragMetadata.contextLength = knowledgeContext.length;
          
          console.log(`[generatePodcast] Built context string: ${knowledgeContext.length} characters`);
          console.log(`[generatePodcast] Context preview (first 200 chars): ${knowledgeContext.substring(0, 200)}...`);
          console.log(`[generatePodcast] Top match: "${retrievedDocs[0].title}" (similarity: ${retrievedDocs[0].similarity?.toFixed(4) || 'N/A'})`);
        } else {
          console.log('[generatePodcast] ⚠️  No relevant documents found in knowledge base');
          console.log('[generatePodcast] Possible reasons:');
          console.log('[generatePodcast]   1. Knowledge base collection is empty');
          console.log('[generatePodcast]   2. Documents exist but have no embeddings');
          console.log('[generatePodcast]   3. Query similarity is too low');
          console.log('[generatePodcast] Using static context only');
          ragMetadata.documentsFound = 0;
        }
        
        console.log(`[generatePodcast] ===== RAG RETRIEVAL END =====`);
      } catch (ragError) {
        console.error(`[generatePodcast] ❌ RAG retrieval failed: ${ragError.message}`);
        console.error(`[generatePodcast] RAG error stack:`, ragError.stack);
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
      let promptContext = '';
      
      if (knowledgeContext) {
        promptContext = `\n--- KNOWLEDGE BASE INFORMATION (Use this as your primary source of facts) ---\n${knowledgeContext}\n--- END KNOWLEDGE BASE INFORMATION ---\n\n`;
        console.log(`[generatePodcast] ✓ RAG context included in prompt (${knowledgeContext.length} chars)`);
      } else {
        console.log(`[generatePodcast] ⚠️  No RAG context - using static context only`);
      }
      
      if (context) {
        promptContext += `Additional context provided by user: ${context}\n\n`;
      }
      
      // Add static context as fallback/reference
      promptContext += `General Context about PETRONAS Upstream and Systemic Shifts:\n${systemicShiftsContext}\n`;

      const podcastPrompt = `You are creating an educational podcast script for PETRONAS Upstream employees about: "${topic}"

${promptContext}

Create a professional, engaging podcast script with the following structure:

1. **OUTLINE**: A brief outline of the podcast covering 3-5 main sections/topics
2. **SCRIPT**: A full conversational script between a host and guest expert, written in a natural, engaging podcast style. Include:
   - Introduction (host introduces topic and guest)
   - Main discussion sections (3-5 sections)
   - Q&A segments within each section (2-3 questions per section)
   - Conclusion (key takeaways and closing)
3. **SECTIONS**: Break down the script into structured sections with:
   - Title for each section
   - Content/transcript for that section
   - Q&A pairs (question and answer)

Format your response as JSON with this exact structure:
{
  "outline": "Brief outline text here",
  "script": "Full conversational script here with HOST: and GUEST: dialogue markers",
  "sections": [
    {
      "title": "Section 1 Title",
      "content": "Section content/transcript",
      "qa": [
        {
          "question": "Question text",
          "answer": "Answer text"
        }
      ]
    }
  ]
}

Make the podcast informative, engaging, and relevant to PETRONAS Upstream operations and Systemic Shifts. Use natural conversation flow, avoid overly technical jargon, and include practical examples where relevant.

${knowledgeContext ? 'IMPORTANT: Prioritize information from the Knowledge Base section above. Use specific facts, data, and details from the knowledge base documents. If you reference information from the knowledge base, do so naturally in the conversation without explicitly mentioning "according to the knowledge base."' : ''}`;

      // Log prompt details for debugging
      console.log(`[generatePodcast] ===== PROMPT DETAILS =====`);
      console.log(`[generatePodcast] Prompt length: ${podcastPrompt.length} characters`);
      console.log(`[generatePodcast] RAG context included: ${knowledgeContext ? 'YES' : 'NO'}`);
      if (knowledgeContext) {
        console.log(`[generatePodcast] RAG context length: ${knowledgeContext.length} characters`);
      }
      console.log(`[generatePodcast] Prompt preview (first 500 chars): ${podcastPrompt.substring(0, 500)}...`);
      console.log(`[generatePodcast] ===== END PROMPT DETAILS =====`);

      // Generate podcast content
      console.log(`[generatePodcast] Calling generateWithFallback to generate podcast...`);
      const podcastJson = await generateWithFallback(podcastPrompt, keys, true);
      console.log(`[generatePodcast] Received response from LLM (${podcastJson.length} characters)`);

      // Parse the JSON response
      let podcastData;
      try {
        // Clean up the response (remove markdown code blocks if present)
        let cleanedJson = podcastJson.trim();
        cleanedJson = cleanedJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        podcastData = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error('[generatePodcast] JSON parse error:', parseError);
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

      console.log(`[generatePodcast] Successfully generated podcast with ${podcastData.sections.length} sections`);

      // Generate audio from the script
      let audioUrl = null;
      if (podcastData.script) {
        try {
          console.log('[generatePodcast] Starting audio generation...');
          console.log(`[generatePodcast] Script length: ${podcastData.script.length} characters`);
          audioUrl = await generatePodcastAudio(podcastData.script, topic.trim());
          console.log(`[generatePodcast] Audio generated successfully: ${audioUrl}`);
        } catch (audioError) {
          console.error('[generatePodcast] Audio generation failed:', audioError);
          console.error('[generatePodcast] Audio error stack:', audioError.stack);
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
        topic: topic.trim(),
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

      console.log(`[generatePodcast] ===== RESPONSE SUMMARY =====`);
      console.log(`[generatePodcast] RAG used: ${ragUsed}`);
      console.log(`[generatePodcast] Documents found: ${ragMetadata.documentsFound}`);
      console.log(`[generatePodcast] Context length: ${ragMetadata.contextLength} chars`);
      if (ragMetadata.topDocuments.length > 0) {
        console.log(`[generatePodcast] Top documents: ${ragMetadata.topDocuments.map(d => d.title).join(', ')}`);
      }
      console.log(`[generatePodcast] ===== END RESPONSE SUMMARY =====`);

      res.status(200).send(response);

      } catch (error) {
        console.error("[generatePodcast] Error:", error);
        res.status(500).send({
          error: "Failed to generate podcast",
          message: error.message
        });
      }
    });
  };
}

module.exports = { createGeneratePodcastHandler };

