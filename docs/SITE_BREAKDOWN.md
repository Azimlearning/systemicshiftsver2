# Site Documentation

Complete documentation of the Systemic Shifts Microsite architecture, components, API endpoints, and user flows.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Page Structure](#page-structure)
3. [Component Documentation](#component-documentation)
4. [API Endpoints](#api-endpoints)
5. [Data Flow](#data-flow)
6. [User Flows](#user-flows)
7. [Firestore Collections](#firestore-collections)

## Architecture Overview

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 19
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)

**Backend:**
- Firebase Cloud Functions (Node.js)
- Firebase Cloud Functions (Python)
- Firestore (NoSQL database)
- Firebase Storage
- Firebase Authentication

**AI Services:**
- Google Gemini API
- OpenRouter API
- Hugging Face Inference API
- OpenAI Embeddings (via OpenRouter)

**Local Services:**
- Local Image Generator (`python/local_image_generator.py`) - Runs locally for GPU-accelerated image generation

### Architecture Pattern

The application follows a **serverless architecture** with:
- **Client-side rendering** for most pages (Next.js App Router)
- **Server-side data fetching** for initial page loads
- **Real-time updates** via Firestore listeners
- **Cloud Functions** for backend processing and AI operations

## Page Structure

### Main Pages

```
/app
├── page.js                    # Homepage
├── articles/
│   └── page.js                # Articles hub
├── statsx/
│   └── page.js                # StatsX analytics dashboard
├── nexusgpt/
│   └── page.js                # NexusGPT chatbot
├── nexushub/
│   ├── page.js                # NexusHub overview
│   ├── layout.js              # NexusHub navigation layout
│   ├── collaterals/
│   │   └── page.js            # Collaterals page
│   ├── upg/
│   │   └── page.js            # Upstream Gallery
│   └── dropbox/
│       └── page.js            # Systemic Shifts Dropbox
├── ulearn/
│   └── page.js                # ULearn podcast generator
├── meetx/
│   └── page.js                # MeetX meeting organizer
├── submit-story/
│   └── page.js                # Story submission form
└── systemic-shifts/
    └── [various pages]        # Systemic Shifts content pages
```

## Component Documentation

### Core Components

#### Header (`src/components/Header.js`)
- Main navigation bar
- Dropdown menus for sections
- Responsive mobile menu
- User authentication state

#### Footer (`src/components/Footer.js`)
- Site footer with links
- Contact information
- Social media links

#### AIPoweredFeatures (`src/components/AIPoweredFeatures.js`)
- Orbital visualization of AI features
- Feature cards with links
- Interactive hover effects

### StatsX Components

#### StatsDashboard (`src/components/StatsX/StatsDashboard.js`)
- Main dashboard container
- Metric cards
- Widget grid layout
- Cross-filtering support

#### ArticleEngagement (`src/components/StatsX/ArticleEngagement.js`)
- Article analytics widget
- Views, likes, comments tracking
- Time series charts
- Category breakdown
- Top articles list

#### TrendChart (`src/components/StatsX/TrendChart.js`)
- Interactive trend visualization
- Multiple metric support
- Date range filtering

### Article Components

#### ArticleCard (`src/components/ArticleCard.js`)
- Article display card
- Like/unlike functionality
- View tracking
- Comment count display
- Category badges

#### ArticleFilters (`src/components/ArticleFilters.js`)
- Category filtering
- Active filter highlighting
- Smooth transitions

### Dropbox Components

#### SystemicShiftsDropbox (`src/components/SystemicShiftsDropbox.js`)
- Story submission display
- Pagination
- AI-generated content display
- Image generation with loading bar
- Real-time Firestore updates

## API Endpoints

### Cloud Functions (Node.js)

Base URL: `https://us-central1-systemicshiftv2.cloudfunctions.net`  
Alternative Base URL (v2): `https://[function-name]-el2jwxb5bq-uc.a.run.app`

#### Active Functions (Frontend-Used)

##### 1. askChatbot
**Endpoint:** `POST /askChatbot` or `https://askchatbot-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/app/nexusgpt/page.js`, `src/components/MiniChatWidget.js`  
**Description:** NexusGPT chatbot with RAG (Retrieval-Augmented Generation) retrieval from knowledge base  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 120 seconds  
**Memory:** 512MiB  
**Request Body:**
```json
{
  "message": "What is Portfolio High-Grading?"
}
```
**Response:**
```json
{
  "reply": "Answer text...",
  "suggestions": ["Follow-up question 1", "Follow-up question 2"],
  "citations": [
    {
      "title": "Document Title",
      "sourceUrl": "https://...",
      "category": "category",
      "similarity": 0.85
    }
  ]
}
```

##### 2. submitStory (Legacy - Replaced by Local API)
**Endpoint:** `POST /submitStory` or `https://submitstory-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ DEPRECATED - Replaced by local API route  
**Used in:** No longer used by frontend  
**Note:** Frontend now uses `/api/submit-story` local Next.js API route instead

##### 2a. Local Story Submission API
**Endpoint:** `POST /api/submit-story` (local Next.js API route)  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/SubmitStories.js`  
**Description:** Handles story submission form with file uploads (write-up and visuals) locally  
**Location:** `src/app/api/submit-story/route.js`  
**Request:** Multipart form data (fields: name, department, storyTitle, story, etc. + files)  
**Response:**
```json
{
  "success": true,
  "message": "Story submitted successfully!",
  "storyId": "story-id"
}
```
**Side Effects:** Creates document in `stories` collection, uploads files to Cloud Storage, sets `aiGeneratedImageUrl: "Pending local generation"`, triggers `analyzeStorySubmission`

##### 3. generateImageHf (Legacy - Replaced by Local Generator)
**Endpoint:** `POST /generateImageHf` or `https://generateimagehf-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ DEPRECATED - Replaced by local image generator  
**Note:** Image generation is now handled locally by `python/local_image_generator.py`

##### 3a. Local Image Generator Service
**Location:** `python/local_image_generator.py`  
**Status:** ✅ Active - Primary image generation method  
**Description:** Local service that monitors Firestore and generates images using local GPU  
**How It Works:**
1. Monitors Firestore `stories` collection every 30 seconds
2. Detects stories with `aiInfographicConcept` but no `aiGeneratedImageUrl` (or `aiGeneratedImageUrl === "Pending local generation"`)
3. Generates image locally using Hugging Face diffusers (GPU-accelerated)
4. Uploads generated image to Firebase Storage
5. Updates Firestore document with `aiGeneratedImageUrl` and `imageGeneratedLocally: true`

**Setup Requirements:**
- Python 3.9+
- PyTorch with CUDA (for GPU) or CPU version
- Firebase service account key (`firebase-key.json`)
- Hugging Face API token (`HF_API_TOKEN` environment variable)

**Running:**
```powershell
cd python
.\run_local_generator.ps1
```

**Benefits:**
- Uses local GPU (much faster than Cloud Functions)
- No 5GB model download in Cloud Functions
- Works offline once model is downloaded
- Full control over generation parameters

##### 4. triggerImageGeneration
**Endpoint:** `POST /triggerImageGeneration` or `https://triggerimagegeneration-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/SystemicShiftsDropbox.js`  
**Description:** Manually trigger image generation for an existing story document  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`, `HF_API_TOKEN`  
**Timeout:** 600 seconds (10 minutes)  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "storyId": "story-id"
}
```
**Response:**
```json
{
  "status": "ok",
  "message": "Image generation triggered."
}
```
**Side Effects:** Calls `generateImageHf` internally, updates Firestore document

##### 5. generatePodcast
**Endpoint:** `POST /generatePodcast` or `https://generatepodcast-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/PodcastGenerator.js`  
**Description:** Generate AI podcast script and audio from a topic using RAG  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "topic": "Topic name",
  "context": "Additional context (optional)"
}
```
**Response:**
```json
{
  "status": "ok",
  "script": "Podcast script text...",
  "audioUrl": "https://storage.googleapis.com/..."
}
```

##### 6. analyzeImage
**Endpoint:** `POST /analyzeImage` or `https://analyzeimage-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/UpstreamGallery.js`  
**Description:** Analyze uploaded image with AI to generate tags and descriptions  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 120 seconds  
**Memory:** 512MiB  
**Request Body:**
```json
{
  "imageUrl": "https://storage.googleapis.com/..."
}
```
**Response:**
```json
{
  "status": "ok",
  "tags": ["tag1", "tag2"],
  "description": "Image description..."
}
```

##### 7. injectKnowledgeBase
**Endpoint:** `POST /injectKnowledgeBase` or `https://injectknowledgebase-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/KnowledgeBaseInjector.js`  
**Description:** Add a single document to the knowledge base collection  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 60 seconds  
**Memory:** 512MiB  
**Request Body:**
```json
{
  "title": "Document Title",
  "content": "Document content...",
  "category": "systemic-shifts",
  "source": "manual",
  "sourceUrl": "https://...",
  "tags": ["tag1", "tag2"]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Document added successfully",
  "docId": "document-id"
}
```

##### 8. uploadKnowledgeBase
**Endpoint:** `POST /uploadKnowledgeBase` or `https://uploadknowledgebase-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/KnowledgeBaseInjector.js`  
**Description:** Upload a document (PDF, DOCX) to Cloud Storage and extract text to inject into knowledge base  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Request:** Multipart form data (file + metadata)  
**Response:**
```json
{
  "success": true,
  "message": "Document uploaded and processed",
  "docId": "document-id"
}
```

##### 9. processMeetingFile
**Endpoint:** `POST /processMeetingFile` or `https://processmeetingfile-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/MeetX/MeetingEditor.js`  
**Description:** Process uploaded meeting files (PDF, DOCX, TXT) and extract text content  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "fileUrl": "https://storage.googleapis.com/...",
  "fileName": "meeting-notes.pdf",
  "fileType": "application/pdf"
}
```
**Response:**
```json
{
  "success": true,
  "extractedText": "Meeting content...",
  "wordCount": 500
}
```

##### 10. generateMeetingInsights
**Endpoint:** `POST /generateMeetingInsights` or `https://generatemeetinginsights-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used by frontend  
**Used in:** `src/components/MeetX/MeetingEditor.js`  
**Description:** Generate AI insights, summaries, and action items from meeting content  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Request Body:**
```json
{
  "meetingId": "meeting-id",
  "content": "Meeting content...",
  "title": "Meeting Title"
}
```
**Response:**
```json
{
  "success": true,
  "summary": "Meeting summary...",
  "actionItems": ["Action 1", "Action 2"],
  "insights": "Key insights..."
}
```

#### Admin Functions (Manual Use Only)

##### 11. populateKnowledgeBase
**Endpoint:** `GET /populateKnowledgeBase` or `https://populateknowledgebase-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ Admin Function - Manual use only  
**Description:** Populate the knowledge base collection with predefined content from website components  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 300 seconds  
**Memory:** 1GiB  
**Usage:** Called manually via HTTP GET request or Firebase Console (typically during initial setup)  
**Response:**
```json
{
  "success": true,
  "message": "Successfully populated knowledge base with X documents",
  "count": 50
}
```
**Note:** Run this before `generateEmbeddings` to populate initial content

##### 12. generateEmbeddings
**Endpoint:** `GET /generateEmbeddings` or `https://generateembeddings-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ Admin Function - Manual use only  
**Description:** Generate vector embeddings for all documents in the knowledge base collection (required for RAG functionality)  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Usage:** Called manually after populating knowledge base or when new documents are added  
**Response:**
```json
{
  "success": true,
  "message": "Generated embeddings for X documents",
  "processed": 50
}
```
**Note:** Must be run after `populateKnowledgeBase` or when adding new documents to enable RAG search

### Cloud Functions (Python)

Located in `functions-python/` directory, deployed separately.

##### generateImageHfPython
**Endpoint:** `POST /generateImageHfPython` or `https://generateimagehfpython-el2jwxb5bq-uc.a.run.app`  
**Status:** ✅ Active - Used internally  
**Used in:** Called internally by `analyzeStorySubmission` as fallback/alternative to Node.js version  
**Description:** Python-based image generation using Hugging Face (diffusers library)  
**Secrets:** `HF_API_TOKEN`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Request Body:** Same as Node.js `generateImageHf`  
**Response:** Same as Node.js `generateImageHf`  
**Note:** Used as alternative/fallback to the Node.js implementation

##### analyzeImagePython
**Endpoint:** `POST /analyzeImagePython`  
**Status:** ⚠️ Defined but usage unclear  
**Description:** Python-based image analysis (alternative to Node.js `analyzeImage`)  
**Note:** Check if this is actively used or can be removed

### Firestore Triggers

##### analyzeStorySubmission
**Trigger:** `onDocumentCreated('stories/{storyId}')`  
**Status:** ✅ Active - Automatic trigger  
**Description:** Automatically analyzes new story submissions when a document is created in the `stories` collection  
**Secrets:** `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`  
**Timeout:** 540 seconds (9 minutes)  
**Memory:** 1GiB  
**Actions:**
1. Extracts text from uploaded write-up file (if provided)
2. Generates AI writeup using Gemini/OpenRouter
3. Creates infographic concept for image generation
4. Updates Firestore document with `aiGeneratedWriteup` and `aiInfographicConcept`
5. Sets `aiGeneratedImageUrl` to "Pending local generation" (local generator will process)
6. Sets `analysisTimestamp` to current time
**Side Effects:** Updates `stories` document with AI-generated content. Local image generator service monitors and processes image generation asynchronously.

## Data Flow

### Story Submission Flow

```
User submits form
    ↓
Local API route (/api/submit-story)
    ↓
Save to Firestore 'stories' collection
    ↓
analyzeStorySubmission trigger fires
    ↓
Generate AI writeup (saves immediately)
    ↓
Generate infographic concept
    ↓
Set aiGeneratedImageUrl = "Pending local generation"
    ↓
Local Image Generator (python/local_image_generator.py)
    - Monitors Firestore every 30 seconds
    - Detects stories needing image generation
    ↓
Image generated locally using GPU
    ↓
Image uploaded to Firebase Storage
    ↓
Update Firestore with image URL
    ↓
Frontend updates via Firestore listener
```

### RAG Query Flow

```
User asks question in NexusGPT
    ↓
askChatbot function called
    ↓
Generate query embedding
    ↓
Retrieve relevant documents (cosine similarity)
    ↓
Build context string from top documents
    ↓
Enhance system prompt with context
    ↓
Call LLM (Gemini/OpenRouter)
    ↓
Return answer with citations
```

### Article Engagement Flow

```
User views article
    ↓
trackArticleView() called
    ↓
Create/update articleEngagement document
    ↓
Increment views count
    ↓
User likes article
    ↓
toggleArticleLike() called
    ↓
Create/delete articleLikes document
    ↓
Update articleEngagement likes count
    ↓
User adds comment
    ↓
addArticleComment() called
    ↓
Create articleComments document
    ↓
Update articleEngagement comments count
```

## User Flows

### 1. Story Submission Flow

1. User navigates to Submit Story page
2. Fills out submission form
3. Uploads writeup and visuals
4. Submits form
5. Form data sent to `submitStory` function
6. Story saved to Firestore
7. AI analysis triggered automatically
8. User can view writeup immediately
9. Image generation happens asynchronously
10. Loading bar shows progress
11. Image appears when complete

### 2. NexusGPT Chat Flow

1. User navigates to NexusGPT page
2. Types question
3. Question sent to `askChatbot` function
4. RAG system retrieves relevant documents
5. Context built from documents
6. LLM generates answer
7. Answer displayed with citations
8. Follow-up suggestions shown

### 3. Article Engagement Flow

1. User browses Articles page
2. Sees article cards with engagement metrics
3. Clicks on article
4. View tracked automatically
5. User can like article
6. Like count updates in real-time
7. User can add comment
8. Comment appears immediately
9. StatsX dashboard shows aggregated data

### 4. StatsX Analytics Flow

1. User navigates to StatsX page
2. Dashboard loads with initial data
3. Various widgets display metrics
4. User can filter data
5. Charts update based on filters
6. Real-time updates via Firestore listeners

## Firestore Collections

### stories
**Description:** Story submissions  
**Fields:**
- `submittedAt`: Timestamp
- `storyTitle`: String
- `aiGeneratedWriteup`: String
- `aiInfographicConcept`: Object
- `aiGeneratedImageUrl`: String (initially "Pending local generation", then actual URL)
- `analysisTimestamp`: Timestamp (when AI analysis completed)
- `imageGeneratedAt`: Timestamp (when image generation completed)
- `imageGeneratedLocally`: Boolean (true if generated by local service)

### articleEngagement
**Description:** Article engagement metrics  
**Fields:**
- `articleId`: String
- `views`: Number
- `likes`: Number
- `comments`: Number
- `category`: String

### articleLikes
**Description:** User likes on articles  
**Fields:**
- `articleId`: String
- `userId`: String
- `timestamp`: Timestamp

### articleComments
**Description:** Article comments  
**Fields:**
- `articleId`: String
- `userId`: String
- `userName`: String
- `commentText`: String
- `timestamp`: Timestamp

### knowledgeBase
**Description:** Knowledge base documents for RAG  
**Fields:**
- `title`: String
- `content`: String
- `category`: String
- `embedding`: Array<Number>
- `sourceUrl`: String

### analytics
**Description:** Analytics events  
**Fields:**
- `type`: String ("page_view" | "event" | "article_view")
- `pagePath`: String
- `userId`: String
- `timestamp`: Timestamp
- `metadata`: Object

### meetings
**Description:** Meeting records  
**Fields:**
- `title`: String
- `date`: Timestamp
- `notes`: String
- `aiInsights`: Object

## Component Hierarchy

```
App
├── Header
├── Main Content
│   ├── Homepage
│   │   ├── Hero
│   │   ├── AIPoweredFeatures
│   │   └── WebsiteCapabilities
│   ├── StatsX
│   │   └── StatsDashboard
│   │       ├── MetricCard (x4)
│   │       ├── ArticleEngagement
│   │       ├── StoryAnalytics
│   │       └── [other widgets]
│   ├── Articles
│   │   ├── ArticleFilters
│   │   └── ArticleCard (multiple)
│   └── [other pages]
└── Footer
```

## State Management

### Client-Side State
- React Hooks (useState, useEffect)
- Local component state
- Firestore real-time listeners for updates

### Server-Side State
- Firestore database
- Firebase Storage for files
- Cloud Functions for processing

## Error Handling

### Frontend
- Try-catch blocks in async functions
- Error boundaries for React components
- User-friendly error messages
- Fallback UI for failed operations

### Backend
- Comprehensive error logging
- Graceful degradation
- Retry mechanisms for API calls
- Status codes for different error types

## Performance Optimizations

### Frontend
- Next.js Image optimization
- Code splitting
- Lazy loading components
- Memoization where appropriate

### Backend
- Cloud Functions timeout optimization
- Firestore query optimization
- Caching strategies
- Batch operations

## Security Considerations

### Authentication
- Firebase Authentication
- Protected routes
- Role-based access control

### Data Security
- Firestore security rules
- Input validation
- API key protection
- CORS configuration

## Local Services

### Local Image Generator

**Location:** `python/local_image_generator.py`

**Purpose:** Generate AI images locally using GPU instead of Cloud Functions

**Setup:**
1. Install Python dependencies: `pip install -r requirements.txt`
2. Install PyTorch with CUDA (for GPU support)
3. Set up Firebase authentication (service account key or gcloud auth)
4. Set `HF_API_TOKEN` environment variable
5. Run: `python local_image_generator.py` or use `run_local_generator.ps1`

**How It Works:**
- Monitors Firestore `stories` collection every 30 seconds
- Detects stories needing image generation (`aiInfographicConcept` exists but `aiGeneratedImageUrl` is missing or "Pending local generation")
- Generates image using Hugging Face diffusers library
- Uploads to Firebase Storage
- Updates Firestore with image URL

**Benefits:**
- Faster generation using local GPU
- No Cloud Functions deployment needed
- Works offline once model is downloaded
- Lower costs (no Cloud Functions execution time)

**See:** `SETUP.md` for detailed setup instructions

## Future Enhancements

- [ ] Unit and integration tests
- [ ] E2E testing with Playwright
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics integration
- [ ] A/B testing framework

