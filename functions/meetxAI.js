// functions/meetxAI.js

const { generateWithFallback } = require('./aiHelper');
const { ChatbotRAGRetriever } = require('./chatbotRAGRetriever');
const { generateEmbedding, cosineSimilarity } = require('./embeddingsHelper');
const admin = require('firebase-admin');

function getDb() {
  return admin.firestore();
}

/**
 * Feature A: Generate Meeting Summary
 */
async function generateMeetingSummary(content, keys) {
  try {
    const prompt = `Summarize this meeting in 3-5 bullet points covering:
- Key decisions made
- Main topics discussed
- Important outcomes
- Next steps mentioned

Meeting content:
${content.substring(0, 8000)}`;

    const summary = await generateWithFallback(prompt, keys);
    return summary;
  } catch (error) {
    console.error('[MeetX AI] Error generating summary:', error);
    return 'Failed to generate summary';
  }
}

/**
 * Feature B: Generate Cascading Summary (Simplified for flat structure)
 */
async function generateCascadingSummary(meetingContent, meetingTitle, keys) {
  try {
    // For flat structure, we'll analyze how this meeting relates to organizational context
    const prompt = `Analyze this meeting and provide contextual insights:
- How does this meeting relate to broader organizational goals?
- What strategic themes or patterns emerge?
- How might this meeting impact other departments or teams?

Meeting Title: ${meetingTitle}
Meeting Content:
${meetingContent.substring(0, 6000)}`;

    const cascadingSummary = await generateWithFallback(prompt, keys);
    return cascadingSummary;
  } catch (error) {
    console.error('[MeetX AI] Error generating cascading summary:', error);
    return 'Failed to generate contextual analysis';
  }
}

/**
 * Feature C: Check Alignment with Previous Meetings
 */
async function checkAlignment(meetingContent, meetingTitle, keys) {
  try {
    // Use RAG to find related meetings
    const retriever = new ChatbotRAGRetriever();
    const query = `${meetingTitle}: ${meetingContent.substring(0, 500)}`;
    
    // Search in meetings collection
    const db = getDb();
    const meetingsSnapshot = await db.collection('meetings')
      .where('embedding', '!=', null)
      .limit(50)
      .get();

    if (meetingsSnapshot.empty) {
      return [];
    }

    // Get query embedding
    const queryEmbedding = await generateEmbedding(query, keys);
    
    // Calculate similarities
    const relatedMeetings = [];
    for (const doc of meetingsSnapshot.docs) {
      const meetingData = doc.data();
      if (meetingData.embedding && Array.isArray(meetingData.embedding)) {
        const similarity = cosineSimilarity(queryEmbedding, meetingData.embedding);
        if (similarity > 0.7) {
          relatedMeetings.push({
            id: doc.id,
            title: meetingData.title,
            content: meetingData.content,
            similarity
          });
        }
      }
    }

    // Sort by similarity
    relatedMeetings.sort((a, b) => b.similarity - a.similarity);
    const topRelated = relatedMeetings.slice(0, 3);

    if (topRelated.length === 0) {
      return [];
    }

    // Check for conflicts
    const contextText = topRelated.map(m => `[${m.title}]\n${m.content.substring(0, 1000)}`).join('\n\n');
    const prompt = `Analyze if decisions in this new meeting contradict previous meetings.

New Meeting:
Title: ${meetingTitle}
Content: ${meetingContent.substring(0, 3000)}

Previous Related Meetings:
${contextText}

Check for:
- Conflicting decisions or directives
- Contradictory goals or strategies
- Inconsistent action items

Return a JSON array of warnings, each with "type" and "message" fields. If no conflicts, return empty array [].
Format: {"warnings": [{"type": "Conflict Type", "message": "Description"}]}`;

    const response = await generateWithFallback(prompt, keys, true);
    let warnings = [];
    
    try {
      const parsed = JSON.parse(response);
      if (parsed.warnings && Array.isArray(parsed.warnings)) {
        warnings = parsed.warnings;
      }
    } catch (parseError) {
      // Try to extract warnings from text response
      if (response.toLowerCase().includes('conflict') || response.toLowerCase().includes('contradict')) {
        warnings = [{ type: 'Potential Conflict', message: response.substring(0, 500) }];
      }
    }

    return warnings;
  } catch (error) {
    console.error('[MeetX AI] Error checking alignment:', error);
    return [];
  }
}

/**
 * Feature D: Detect Action Items and Zombie Tasks
 */
async function detectActionItems(meetingContent, keys) {
  try {
    const prompt = `Extract all action items from this meeting. For each action item, identify:
- The task description
- The owner/assignee (if mentioned)
- The due date (if mentioned)
- The status (if mentioned)

Meeting content:
${meetingContent.substring(0, 8000)}

Return a JSON object with this structure:
{
  "actionItems": [
    {
      "task": "Task description",
      "owner": "Person name or null",
      "dueDate": "Date string or null",
      "status": "Status or null"
    }
  ],
  "zombieTasks": ["Task descriptions without owner or due date"]
}

If no action items found, return empty arrays.`;

    const response = await generateWithFallback(prompt, keys, true);
    
    let actionItems = [];
    let zombieTasks = [];

    try {
      const parsed = JSON.parse(response);
      if (parsed.actionItems && Array.isArray(parsed.actionItems)) {
        actionItems = parsed.actionItems;
      }
      if (parsed.zombieTasks && Array.isArray(parsed.zombieTasks)) {
        zombieTasks = parsed.zombieTasks;
      }
    } catch (parseError) {
      // Fallback: try to extract from text
      console.warn('[MeetX AI] Failed to parse action items JSON, using fallback');
      const lines = response.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        if (line.toLowerCase().includes('action') || line.toLowerCase().includes('task')) {
          if (!line.toLowerCase().includes('owner') && !line.toLowerCase().includes('due')) {
            zombieTasks.push(line);
          } else {
            actionItems.push({ task: line, owner: null, dueDate: null, status: null });
          }
        }
      });
    }

    // Identify zombie tasks from action items
    actionItems.forEach(item => {
      if (!item.owner && !item.dueDate && item.task) {
        if (!zombieTasks.includes(item.task)) {
          zombieTasks.push(item.task);
        }
      }
    });

    return { actionItems, zombieTasks };
  } catch (error) {
    console.error('[MeetX AI] Error detecting action items:', error);
    return { actionItems: [], zombieTasks: [] };
  }
}

/**
 * Feature E: Chat with Organization
 */
async function chatWithOrg(query, keys) {
  try {
    const db = getDb();
    
    // Get all meetings with embeddings
    const meetingsSnapshot = await db.collection('meetings')
      .where('embedding', '!=', null)
      .limit(100)
      .get();

    if (meetingsSnapshot.empty) {
      return {
        answer: 'No meetings found in the organization. Please create some meetings first.',
        sources: []
      };
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query, keys);

    // Calculate similarities
    const meetingsWithScores = [];
    for (const doc of meetingsSnapshot.docs) {
      const meetingData = doc.data();
      if (meetingData.embedding && Array.isArray(meetingData.embedding)) {
        const similarity = cosineSimilarity(queryEmbedding, meetingData.embedding);
        meetingsWithScores.push({
          id: doc.id,
          title: meetingData.title,
          content: meetingData.content,
          summary: meetingData.summary,
          similarity
        });
      }
    }

    // Sort by similarity and get top 5
    meetingsWithScores.sort((a, b) => b.similarity - a.similarity);
    const topMeetings = meetingsWithScores.slice(0, 5).filter(m => m.similarity > 0.5);

    if (topMeetings.length === 0) {
      return {
        answer: 'I could not find relevant meetings to answer your question. Try rephrasing or check if meetings exist.',
        sources: []
      };
    }

    // Build context from top meetings
    const contextText = topMeetings.map(m => 
      `[${m.title}]\n${m.summary || m.content.substring(0, 1000)}`
    ).join('\n\n');

    const prompt = `You are an AI assistant that helps answer questions about organizational meetings.

User Question: ${query}

Relevant Meeting Context:
${contextText}

Provide a comprehensive answer based on the meeting context. If the answer is not in the provided context, say so.
Cite which meetings you're referencing.`;

    const answer = await generateWithFallback(prompt, keys);

    return {
      answer,
      sources: topMeetings.map(m => ({ id: m.id, title: m.title }))
    };
  } catch (error) {
    console.error('[MeetX AI] Error in chat with org:', error);
    return {
      answer: 'Sorry, I encountered an error while processing your question. Please try again.',
      sources: []
    };
  }
}


module.exports = {
  generateMeetingSummary,
  generateCascadingSummary,
  checkAlignment,
  detectActionItems,
  chatWithOrg
};

