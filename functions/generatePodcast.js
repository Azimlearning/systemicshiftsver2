// functions/generatePodcast.js

const { generateWithFallback } = require("./aiHelper");

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

      const podcastPrompt = `You are creating an educational podcast script for PETRONAS Upstream employees about: "${topic}"

${context ? `Additional context provided: ${context}\n` : ''}

${systemicShiftsContext}

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

Make the podcast informative, engaging, and relevant to PETRONAS Upstream operations and Systemic Shifts. Use natural conversation flow, avoid overly technical jargon, and include practical examples where relevant.`;

      // Generate podcast content
      const podcastJson = await generateWithFallback(podcastPrompt, keys, true);

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

      res.status(200).send({
        success: true,
        podcast: podcastData,
        topic: topic.trim()
      });

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

