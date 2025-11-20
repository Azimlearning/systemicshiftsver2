/**
 * RAG Writeup Retriever
 * Retrieves relevant writeup examples based on story content for prompt enhancement
 */
const fs = require('fs');
const path = require('path');

class WriteupRetriever {
  constructor(examplesFile = null) {
    if (examplesFile === null) {
      // Default to same directory as this file
      examplesFile = path.join(__dirname, 'rag_writeup_examples.json');
    }
    
    this.examplesFile = examplesFile;
    this.examplesData = this._loadExamples();
  }

  _loadExamples() {
    try {
      const fileContent = fs.readFileSync(this.examplesFile, 'utf-8');
      const data = JSON.parse(fileContent);
      console.log(`[RAG Writeup] Loaded ${data.examples?.length || 0} writeup examples`);
      return data;
    } catch (error) {
      console.warn(`[RAG Writeup] Failed to load examples: ${error.message}. Continuing without RAG.`);
      return { examples: [] };
    }
  }

  _extractKeywords(text) {
    if (!text) return [];
    
    const lowerText = text.toLowerCase();
    const keywordPatterns = [
      'technology', 'innovation', 'iam', 'integrated', 'asset', 'management',
      'real-time', 'monitoring', 'surveillance', 'data', 'workflow',
      'drilling', 'well', 'campaign', 'risk', 'standards', 'design', 'optimization',
      'contract', 'cost', 'savings', 'performance', 'completion',
      'vessel', 'fsv', 'field support', 'operational', 'efficiency',
      'hpc', 'ai', 'artificial intelligence', 'seismic', 'exploration', 'platform',
      'decarbonisation', 'decarbonization', 'flaring', 'emissions', 'ghg', 'carbon',
      'climate', 'sustainability', 'environmental', 'emission',
      'production', 'gas', 'condensate', 'oil', 'reservoir'
    ];

    const foundKeywords = [];
    for (const keyword of keywordPatterns) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    return foundKeywords;
  }

  _calculateSimilarity(storyKeywords, storyData, example) {
    let score = 0;
    const exampleKeywords = example.keywords || [];
    const exampleTopics = example.keyTopics || [];
    const exampleTheme = example.theme || '';

    // Keyword matching
    const keywordMatches = storyKeywords.filter(kw => 
      exampleKeywords.some(ekw => ekw.includes(kw) || kw.includes(ekw))
    );
    score += (keywordMatches.length / Math.max(storyKeywords.length, 1)) * 0.4;

    // Theme matching (if story has similar theme indicators)
    const storyText = `${storyData.storyTitle || ''} ${storyData.nonShiftTitle || ''} ${storyData.nonShiftDescription || ''}`.toLowerCase();
    
    if (exampleTheme === 'sustainability' && (storyText.includes('carbon') || storyText.includes('emission') || storyText.includes('flaring'))) {
      score += 0.3;
    }
    if (exampleTheme === 'technology_innovation' && (storyText.includes('technology') || storyText.includes('innovation') || storyText.includes('system'))) {
      score += 0.3;
    }
    if (exampleTheme === 'operational_excellence' && (storyText.includes('operational') || storyText.includes('efficiency') || storyText.includes('optimization'))) {
      score += 0.3;
    }
    if (exampleTheme === 'cost_optimization' && (storyText.includes('cost') || storyText.includes('saving') || storyText.includes('budget'))) {
      score += 0.3;
    }

    // Topic matching
    const topicMatches = exampleTopics.filter(topic => 
      storyText.includes(topic.toLowerCase())
    );
    score += (topicMatches.length / Math.max(exampleTopics.length, 1)) * 0.3;

    return Math.min(score, 1.0);
  }

  retrieveExamples(storyData, topK = 2) {
    if (!this.examplesData.examples || this.examplesData.examples.length === 0) {
      console.warn('[RAG Writeup] No examples available');
      return [];
    }

    // Extract keywords from story
    const storyText = `${storyData.storyTitle || ''} ${storyData.nonShiftTitle || ''} ${storyData.nonShiftDescription || ''} ${storyData.caseForChange || ''}`;
    const storyKeywords = this._extractKeywords(storyText);
    
    console.log(`[RAG Writeup] Extracted keywords: ${storyKeywords.slice(0, 10).join(', ')}...`);

    // Calculate similarity for each example
    const examplesWithScores = this.examplesData.examples.map(example => ({
      example,
      score: this._calculateSimilarity(storyKeywords, storyData, example)
    }));

    // Sort by score (descending)
    examplesWithScores.sort((a, b) => b.score - a.score);

    // Return top K examples
    const topExamples = examplesWithScores.slice(0, topK).map(item => item.example);
    
    if (topExamples.length > 0) {
      console.log(`[RAG Writeup] Retrieved ${topExamples.length} example(s). Top match: ${topExamples[0].id} (score: ${examplesWithScores[0].score.toFixed(2)})`);
    }

    return topExamples;
  }

  enhancePrompt(basePrompt, examples) {
    if (!examples || examples.length === 0) {
      return basePrompt;
    }

    // Use the top example (most relevant)
    const topExample = examples[0];
    
    // Build context from examples
    let exampleContext = '\n\n--- Reference: Successful Writeup Examples ---\n';
    exampleContext += 'Here are examples of successful writeups that match similar themes:\n\n';
    
    // Add top 2 examples (truncated to avoid token limits)
    examples.slice(0, 2).forEach((example, idx) => {
      exampleContext += `Example ${idx + 1}: ${example.title}\n`;
      exampleContext += `Theme: ${example.theme}\n`;
      exampleContext += `Structure: ${example.structure?.sections?.join(' → ') || 'N/A'}\n`;
      exampleContext += `Style: ${example.structure?.style || 'N/A'}, Tone: ${example.structure?.tone || 'N/A'}\n`;
      
      // Add a snippet of the writeup (first 300 chars)
      const writeupSnippet = example.writeup.substring(0, 300).replace(/\n/g, ' ');
      exampleContext += `Snippet: "${writeupSnippet}..."\n\n`;
    });

    exampleContext += '--- End Examples ---\n\n';
    exampleContext += 'Instructions: Use these examples as reference for structure, tone, and style. ';
    exampleContext += `Follow a similar ${topExample.structure?.style || 'narrative'} approach with ${topExample.structure?.tone || 'professional'} tone. `;
    exampleContext += `Structure your writeup with sections like: ${topExample.structure?.sections?.join(', ') || 'introduction, body, conclusion'}. `;
    exampleContext += 'Maintain PETRONAS Upstream professional communication standards.\n';

    const enhancedPrompt = basePrompt + exampleContext;
    
    // Log prompt length (rough estimate: 1 token ≈ 4 chars)
    const estimatedTokens = enhancedPrompt.length / 4;
    console.log(`[RAG Writeup] Enhanced prompt: ~${Math.round(estimatedTokens)} tokens (base: ~${Math.round(basePrompt.length / 4)} tokens)`);

    return enhancedPrompt;
  }
}

module.exports = { WriteupRetriever };

