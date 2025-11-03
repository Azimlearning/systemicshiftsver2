# Systemic Shifts Microsite - Code Analysis & Implementation Plan

## 📋 Project Overview

This is a Next.js 16 website for PETRONAS Upstream department featuring two main AI capabilities:
1. **NexusGPT** - ChatGPT-style assistant with department knowledge
2. **Story Submission & AI Processing** - Form submission that generates AI write-ups and infographics

---

## 🏗️ Current Architecture

### Frontend (Next.js 16 + React 19)
- **Pages**:
  - `src/app/page.js` - Homepage with various sections
  - `src/app/nexusgpt/page.js` - Chat interface
  - `src/app/submit-story/page.js` - Story submission form
  - `src/app/nexushub/dropbox/page.js` - Admin view of submissions

### Backend (Firebase Functions)
- **Functions**:
  - `submitStory` - Handles form submission, file uploads to Firebase Storage
  - `analyzeStorySubmission` - Triggered when story is created, generates AI content
  - `askChatbot` - Handles NexusGPT chat requests

### AI Infrastructure
- **Models Used**:
  - Text: Gemini Pro, Gemini 2.5/2.0 Flash series (via Google API)
  - Text Fallback: OpenRouter (Mistral, GPT models)
  - Image: Stability AI Stable Diffusion XL (via OpenRouter)
- **Helper Functions** (`functions/aiHelper.js`):
  - `generateWithFallback()` - Iterates through model chain until success
  - `extractTextFromFiles()` - Extracts text from PDF, DOCX, images (OCR)
  - `generateImage()` - Generates infographic images from concepts

---

## ✅ What's Working

### 1. Story Submission Flow
- ✅ Comprehensive form with conditional fields
- ✅ File upload (write-ups, visuals) to Firebase Storage
- ✅ Automatic AI processing on submission:
  - AI-generated write-up
  - AI-generated infographic concept (JSON)
  - AI-generated image draft
- ✅ Dropbox view shows submissions with loading states
- ✅ Pagination for submissions

### 2. NexusGPT (Chatbot)
- ✅ Chat interface with message history
- ✅ Suggestion bubbles for follow-up questions
- ✅ Basic context about PETRONAS goals and shifts
- ✅ UI for file upload (button exists but not connected)

---

## ❌ What Needs Implementation

### 1. RAG (Retrieval Augmented Generation) for NexusGPT

**Current State**: 
- Hardcoded context in system prompt (lines 237-239 in `functions/index.js`)
- Upload button exists but not functional
- No vector storage or semantic search

**Required Implementation**:

#### A. File Upload & Storage System
- [ ] Connect upload button to backend function
- [ ] Accept multiple file types (PDF, DOCX, TXT, images)
- [ ] Store files in Firebase Storage under `knowledge-base/` path
- [ ] Store metadata in Firestore `knowledgeBase` collection

#### B. Text Extraction & Chunking
- [ ] Use existing `extractTextFromFiles()` function
- [ ] Split documents into chunks (500-1000 tokens each)
- [ ] Generate embeddings for each chunk (using Gemini embeddings or similar)
- [ ] Store chunks + embeddings in Firestore with metadata

#### C. Retrieval System
- [ ] When user asks question:
  1. Generate query embedding
  2. Search for similar chunks (cosine similarity)
  3. Retrieve top 3-5 relevant chunks
  4. Inject retrieved context into chatbot prompt

#### D. Context Injection
- [ ] Modify `askChatbot` function to:
  - Accept conversation history
  - Perform semantic search
  - Build enhanced prompt with retrieved context
  - Maintain chat memory/context

**Files to Modify**:
- `functions/index.js` - Add knowledge base upload endpoint, enhance `askChatbot`
- `functions/aiHelper.js` - Add embedding generation, semantic search functions
- `src/app/nexusgpt/page.js` - Connect upload button, send files to backend
- Create `functions/ragHelper.js` - New file for RAG utilities

---

### 2. Enhanced Infographic Generation with Example References

**Current State**:
- Generates infographic concept as JSON
- Creates image from concept
- Does NOT reference example infographics for style

**Required Implementation**:

#### A. Analyze Example Infographics
- [ ] Load example images from `/public/Example-systemic-shifts-stories-inforgraphic/`
- [ ] Use vision model (Gemini 2.0 Flash with vision) to analyze:
  - Layout structure (vertical/horizontal)
  - Color schemes (teal, white, gray patterns)
  - Typography styles
  - Icon usage
  - Data visualization patterns
  - Content sections organization

#### B. Enhanced Infographic Prompt
- [ ] Update `infographicPrompt` in `analyzeStorySubmission` to include:
  - Description of style from examples
  - Specific format requirements
  - Color palette constraints (match examples)
  - Layout preferences

#### C. Image Generation Enhancement
- [ ] Update `generateImage()` in `aiHelper.js` to:
  - Reference example images in prompt
  - Use multi-modal models that can see examples
  - Generate images closer to example style

**Files to Modify**:
- `functions/index.js` - Enhance `infographicPrompt` with example analysis
- `functions/aiHelper.js` - Add function to analyze example images, update `generateImage()`
- Create `functions/infographicStyleAnalyzer.js` - New file for style extraction

---

## 📝 Detailed Implementation Steps

### Phase 1: RAG Implementation for NexusGPT

#### Step 1.1: Create Knowledge Base Upload Endpoint
```javascript
// functions/index.js
exports.uploadKnowledgeBase = onRequest(
  { region: 'us-central1', secrets: [geminiApiKey] },
  async (req, res) => {
    // Handle file upload
    // Extract text
    // Create chunks
    // Generate embeddings
    // Store in Firestore
  }
);
```

#### Step 1.2: Create Embedding Generation Function
```javascript
// functions/ragHelper.js
async function generateEmbedding(text, apiKey) {
  // Use Gemini embeddings API
  // Return embedding vector
}
```

#### Step 1.3: Create Semantic Search Function
```javascript
// functions/ragHelper.js
async function searchKnowledgeBase(queryEmbedding, limit = 5) {
  // Get all chunks from Firestore
  // Calculate cosine similarity
  // Return top matches
}
```

#### Step 1.4: Update askChatbot Function
```javascript
// functions/index.js - askChatbot
// Before generating response:
// 1. Generate query embedding
// 2. Search knowledge base
// 3. Inject context into prompt
```

#### Step 1.5: Connect Frontend Upload
```javascript
// src/app/nexusgpt/page.js
// Add file upload handler
// Send to uploadKnowledgeBase endpoint
// Show success/error feedback
```

---

### Phase 2: Enhanced Infographic Generation

#### Step 2.1: Create Style Analyzer
```javascript
// functions/infographicStyleAnalyzer.js
async function analyzeExampleInfographics() {
  // Load example images from Storage
  // Use Gemini Vision API to describe:
  //   - Layout patterns
  //   - Color schemes
  //   - Typography
  //   - Icon styles
  // Return style guide object
}
```

#### Step 2.2: Update Infographic Generation
```javascript
// functions/index.js - analyzeStorySubmission
// 1. Call analyzeExampleInfographics()
// 2. Include style guide in infographicPrompt
// 3. Pass examples to generateImage()
```

#### Step 2.3: Enhance Image Generation Prompt
```javascript
// functions/aiHelper.js - generateImage()
// Include example descriptions in visual prompt
// Use multi-modal models when available
```

---

## 🔧 Technical Requirements

### New Dependencies Needed

For RAG:
- `@google/generative-ai` - Already installed (for embeddings)
- Vector similarity calculation (can use simple cosine similarity)

For Infographic Analysis:
- Vision-capable model (Gemini 2.0 Flash Preview with vision)
- Image storage access to public folder

### Firebase Structure Changes

New Collections:
```
knowledgeBase/
  - chunks/ (subcollection)
    - chunkId: {
        text: string,
        embedding: number[],
        sourceFile: string,
        chunkIndex: number,
        createdAt: timestamp
      }
  - files/
    - fileId: {
        fileName: string,
        fileUrl: string,
        uploadedAt: timestamp,
        chunksCount: number
      }
```

---

## 📊 Current Prompt Structure

### Write-up Prompt (needs enhancement)
```javascript
const writeupPrompt = `You are an internal communications writer for PETRONAS Upstream... ${fullContextText} ... Generate the write-up now.`;
```
**Issue**: Prompt is truncated in code. Need full prompt template.

### Infographic Prompt (needs style injection)
```javascript
const infographicPrompt = `You are a concept designer... ${fullContextText} ... Format your final output as a JSON object with keys "title", "sections", "keyMetrics", "visualStyle", and "colorPalette". Generate the infographic concept (JSON object) now.`;
```
**Issue**: No reference to example styles.

---

## 🎯 Next Steps

1. **Review this analysis** with the user
2. **Get full prompt templates** from `functions/index.js` (currently truncated)
3. **Decide on embedding approach**:
   - Option A: Use Gemini embeddings (simple, good quality)
   - Option B: Use dedicated embedding service (OpenAI, Cohere)
4. **Prioritize implementation**:
   - Start with RAG for NexusGPT (higher value)
   - Then enhance infographic generation
5. **Create detailed implementation tasks**

---

## 📁 Key Files Reference

### Frontend
- `src/app/nexusgpt/page.js` - Chat UI
- `src/components/SubmitStories.js` - Form component
- `src/components/SystemicShiftsDropbox.js` - Admin view

### Backend
- `functions/index.js` - Main Firebase functions
- `functions/aiHelper.js` - AI utilities
- `functions/ai_models.js` - Model configurations

### Assets
- `public/Example-systemic-shifts-stories-inforgraphic/` - Reference infographics

---

## Questions for User

1. Do you have department knowledge files ready to upload?
2. What format are the knowledge files in? (PDF, DOCX, etc.)
3. Should RAG search across all uploaded files or specific categories?
4. For infographics: Should we strictly match example style or allow variations?
5. Do you have access to Gemini embeddings API or should we use alternative?

