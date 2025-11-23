# Systemic Shifts Microsite - Complete Site Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Dependencies](#dependencies)
4. [File Structure](#file-structure)
5. [Component Documentation](#component-documentation)
6. [Library Functions](#library-functions)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [User Flows](#user-flows)
10. [Firestore Collections](#firestore-collections)
11. [Local Services](#local-services)
12. [Usage Guide](#usage-guide)
13. [Troubleshooting](#troubleshooting)
14. [Future Enhancements](#future-enhancements)

---

## Overview

The Systemic Shifts Microsite is a comprehensive web platform built for PETRONAS to showcase systemic shifts, provide AI-powered tools, and enable content management. The site features real-time analytics, AI-powered content generation, knowledge base management, and interactive engagement features.

### Key Features

- **AI-Powered Content Generation**: Story submissions with AI-generated writeups and images
- **NexusGPT Chatbot**: RAG-powered chatbot with knowledge base integration
- **StatsX Analytics Dashboard**: Real-time analytics with predictive forecasting and anomaly detection
- **Article Engagement System**: Track views, likes, and comments on all articles
- **Knowledge Base Management**: Document injection and RAG search capabilities
- **Meeting Management (MeetX)**: AI-powered meeting insights and organization
- **Podcast Generation (ULearn)**: AI-generated podcast scripts and audio
- **Upstream Gallery**: Image gallery with AI-powered categorization
- **Local Image Generation**: GPU-accelerated local image generation service

---

## Architecture

### Technology Stack

**Frontend:**
- **Next.js 14+** (App Router) - React framework with server-side rendering
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **Recharts 2.12.7** - Chart library for data visualization
- **date-fns 3.6.0** - Date manipulation utilities
- **react-icons 5.5.0** - Icon library

**Backend:**
- **Firebase Cloud Functions (Node.js)** - Serverless backend functions
- **Firebase Cloud Functions (Python)** - Python-based serverless functions
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Authentication** - User authentication

**AI Services:**
- **Google Gemini API** - Primary LLM for text generation
- **OpenRouter API** - Alternative LLM provider and embeddings
- **Hugging Face Inference API** - Image generation (via local service)
- **OpenAI Embeddings** (via OpenRouter) - Vector embeddings for RAG

**Local Services:**
- **Local Image Generator** (`python/local_image_generator.py`) - GPU-accelerated image generation

### Architecture Pattern

The application follows a **serverless architecture** with:

- **Client-side rendering** for most pages (Next.js App Router)
- **Server-side data fetching** for initial page loads
- **Real-time updates** via Firestore listeners (`onSnapshot`)
- **Cloud Functions** for backend processing and AI operations
- **Local services** for resource-intensive tasks (image generation)

### Data Sources

1. **Firestore Collections**:
   - `stories` - Story submissions with AI-generated content
   - `meetings` - Meeting records with AI insights
   - `knowledgeBase` - Documents for RAG search
   - `upstreamGallery` - Image gallery with metadata
   - `analytics` - Page views and user interactions
   - `articleEngagement` - Article engagement metrics
   - `articleLikes` - User likes on articles
   - `articleComments` - Article comments

2. **Real-time Tracking**:
   - Page view events
   - User interactions
   - Click events
   - Article engagement (views, likes, comments)

---

## Dependencies

### Core Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "firebase": "^10.0.0",
  "framer-motion": "^12.23.24",
  "recharts": "^2.12.7",
  "date-fns": "^3.6.0",
  "react-icons": "^5.5.0"
}
```

### Installation

```bash
npm install
```

### Python Dependencies (Local Image Generator)

```txt
torch
diffusers
transformers
firebase-admin
google-cloud-storage
pillow
```

---

## File Structure

```
systemicshiftsver2/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.js                   # Homepage
│   │   ├── articles/
│   │   │   ├── page.js               # Articles hub
│   │   │   └── [id]/
│   │   │       └── page.js           # Individual article page
│   │   ├── statsx/
│   │   │   └── page.js               # StatsX analytics dashboard
│   │   ├── nexusgpt/
│   │   │   └── page.js               # NexusGPT chatbot
│   │   ├── nexushub/
│   │   │   ├── page.js               # NexusHub overview
│   │   │   ├── layout.js             # NexusHub navigation
│   │   │   ├── collaterals/
│   │   │   │   └── page.js           # Collaterals page
│   │   │   ├── upg/
│   │   │   │   └── page.js           # Upstream Gallery
│   │   │   └── dropbox/
│   │   │       └── page.js           # Systemic Shifts Dropbox
│   │   ├── ulearn/
│   │   │   ├── page.js               # ULearn overview
│   │   │   ├── layout.js             # ULearn navigation
│   │   │   └── podcast/
│   │   │       └── page.js           # Podcast generator
│   │   ├── meetx/
│   │   │   └── page.js               # MeetX meeting organizer
│   │   ├── submit-story/
│   │   │   └── page.js               # Story submission form
│   │   └── api/
│   │       └── submit-story/
│   │           └── route.js          # Local API route for story submission
│   ├── components/                   # React components
│   │   ├── Header.js                 # Main navigation header
│   │   ├── Footer.js                 # Site footer
│   │   ├── AIPoweredFeatures.js      # Homepage AI features showcase
│   │   ├── ArticleCard.js            # Article display card
│   │   ├── ArticleFilters.js         # Article category filters
│   │   ├── SystemicShiftsDropbox.js  # Story submission display
│   │   ├── SubmitStories.js          # Story submission form
│   │   ├── UpstreamGallery.js        # Image gallery component
│   │   ├── PodcastGenerator.js       # Podcast generation UI
│   │   ├── MyPodcasts.js             # User's podcast library
│   │   ├── KnowledgeBaseInjector.js # Knowledge base injection UI
│   │   ├── ChatInterface.js          # Chat interface component
│   │   ├── MiniChatWidget.js         # Mini chat widget
│   │   ├── MindsetBehaviour.js       # Mindset & Behaviour content
│   │   ├── OurProgress.js            # Progress tracking component
│   │   ├── StatsX/                   # StatsX dashboard components
│   │   │   ├── StatsDashboard.js     # Main dashboard container
│   │   │   ├── MetricCard.js         # Metric display card
│   │   │   ├── PulseWidget.js        # Health metrics widget
│   │   │   ├── TrendChart.js         # Trend visualization
│   │   │   ├── CohortHeatmap.js      # Activity heatmap
│   │   │   ├── AnomalyDetector.js    # Anomaly detection widget
│   │   │   ├── AIInsightsTicker.js   # AI insights ticker
│   │   │   ├── StoryAnalytics.js     # Story analytics widget
│   │   │   ├── MeetingAnalytics.js   # Meeting analytics widget
│   │   │   ├── EngagementAnalytics.js # Engagement analytics
│   │   │   ├── KnowledgeBaseAnalytics.js # Knowledge base stats
│   │   │   ├── ArticleEngagement.js  # Article engagement widget
│   │   │   └── DataGenerator.js      # Fake data generator UI
│   │   └── MeetX/                    # MeetX components
│   │       ├── MeetingList.js        # Meeting list display
│   │       ├── MeetingEditor.js       # Meeting editor
│   │       └── FileUploader.js       # File upload component
│   └── lib/                          # Utility libraries
│       ├── firebase.js                # Firebase configuration
│       ├── analytics.js               # Analytics tracking system
│       ├── statsData.js               # Data aggregation utilities
│       ├── forecasting.js             # Predictive forecasting
│       ├── anomalyDetection.js        # Anomaly detection algorithms
│       ├── generateFakeData.js        # Fake data generation
│       ├── dataScenarios.js           # Data scenario management
│       └── quizData.js                # Quiz data utilities
├── functions/                        # Node.js Cloud Functions
│   ├── index.js                      # Main functions file
│   ├── aiHelper.js                   # AI helper functions
│   ├── ai_models.js                  # AI model configurations
│   ├── chatbotRAGRetriever.js        # RAG retrieval system
│   ├── rag_writeup_retriever.js     # Writeup RAG retriever
│   ├── knowledgeBaseExtractor.js     # Knowledge base extraction
│   ├── generateEmbeddings.js         # Embedding generation
│   ├── embeddingsHelper.js           # Embedding utilities
│   └── generate_image_hf.js          # Image generation (legacy)
├── functions-python/                 # Python Cloud Functions
│   ├── main.py                       # Main Python functions
│   └── requirements.txt              # Python dependencies
├── python/                           # Local Python services
│   ├── local_image_generator.py      # Local image generator service
│   ├── rag_image_retriever.py        # RAG image style retriever
│   ├── requirements.txt              # Python dependencies
│   └── run_local_generator.ps1       # PowerShell script to run generator
└── public/                           # Static assets
    └── StatsXNotes/                  # StatsX documentation
        └── STATSX_IMPLEMENTATION.md  # Detailed StatsX docs
```

## Component Documentation

### Core Components

#### 1. Header Component (`src/components/Header.js`)

**Purpose**: Main navigation bar with dropdown menus and responsive mobile support.

**Features**:
- **Dropdown Navigation**: Microsoft/Apple-style dropdown menus for Systemic Shifts, ULearn, and NexusHub
- **Second-Level Navigation**: Appears when in specific sections (Systemic Shifts, ULearn, NexusHub)
- **Responsive Design**: Mobile hamburger menu for small screens
- **Active State Highlighting**: Highlights current page in navigation
- **Click-Outside Detection**: Closes dropdowns when clicking outside

**Props**: None (uses `usePathname` hook internally)

**State Management**:
- `isSystemicShiftsOpen`: Boolean - Controls Systemic Shifts dropdown
- `isUlearnOpen`: Boolean - Controls ULearn dropdown
- `isNexusHubOpen`: Boolean - Controls NexusHub dropdown
- `isMobileMenuOpen`: Boolean - Controls mobile menu visibility

**Navigation Structure**:
```javascript
const navItems = [
  { name: 'Home', href: '/#home', type: 'link' },
  { name: 'PETRONAS 2.0', href: '/petronas-2.0', type: 'link' },
  { 
    name: 'Systemic Shifts', 
    type: 'dropdown',
    subItems: [
      { name: 'Upstream Target', href: '/systemic-shifts/upstream-target' },
      { name: 'Key Shifts', href: '/systemic-shifts/key-shifts' },
      { name: 'Mindset & Behaviour', href: '/systemic-shifts/mindset-behaviour' },
      { name: 'Our Progress', href: '/systemic-shifts/our-progress' },
    ]
  },
  // ... more items
];
```

**Technical Details**:
- Uses `useRef` for dropdown references
- `useEffect` for click-outside detection
- `usePathname` from Next.js for active state detection
- Framer Motion for smooth dropdown animations

**Example Usage**:
```jsx
import Header from '@/components/Header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
```

---

#### 2. Footer Component (`src/components/Footer.js`)

**Purpose**: Site footer with links, contact information, and social media.

**Features**:
- Quick links to main sections
- Contact information display
- Social media icon links
- Copyright information
- Responsive grid layout

**Props**: None

**Layout Structure**:
- Multi-column grid (responsive)
- Link sections organized by category
- Social media icons with hover effects

**Example Usage**:
```jsx
import Footer from '@/components/Footer';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
```

---

#### 3. AIPoweredFeatures Component (`src/components/AIPoweredFeatures.js`)

**Purpose**: Homepage showcase of AI-powered features with orbital animation design.

**Features**:
- **Orbital Animation**: Circular gradient cards orbiting around center logo
- **Glass-morphism Background**: Modern glass effect styling
- **Connection Lines**: Visual lines connecting cards to center
- **Hover Effects**: Enhanced hover interactions
- **Gradient Cards**: Theme-matched gradient cards for each feature
- **Hydration-Safe**: Prevents React hydration errors with `mounted` state

**Props**: None

**State Management**:
- `rotation`: Number - Current rotation angle (0-360)
- `hoveredCard`: String | null - Currently hovered card ID
- `mounted`: Boolean - Client-side mount flag (prevents hydration errors)

**AI Features Displayed**:
```javascript
const AI_FEATURES = [
  {
    id: 'dropbox',
    name: 'Systemic Shifts Dropbox',
    description: 'AI image and writeup generator',
    icon: FaCloudUploadAlt,
    href: '/nexushub/dropbox',
    gradient: 'from-teal-400 to-cyan-500',
    color: '#14b8a6',
    angle: 0,
    radius: 180,
  },
  // ... 5 more features
];
```

**Technical Details**:
- **Orbital Calculation**: Cards positioned using `transform: rotate()` and `translateX()`
- **Animation**: Continuous rotation via `setInterval` (0.2° per 30ms)
- **Hydration Fix**: Uses `mounted` state to prevent server/client mismatch
- **Performance**: Conditional rotation only after mount to prevent hydration errors

**Animation Logic**:
```javascript
// Orbital rotation (only after mount)
useEffect(() => {
  if (!mounted) return;
  
  const rotationInterval = setInterval(() => {
    setRotation(prev => (prev + 0.2) % 360);
  }, 30);

  return () => clearInterval(rotationInterval);
}, [mounted]);
```

**Example Usage**:
```jsx
import AIPoweredFeatures from '@/components/AIPoweredFeatures';

export default function HomePage() {
  return (
    <div>
      <AIPoweredFeatures />
    </div>
  );
}
```

---

### Article Components

#### 4. ArticleCard Component (`src/components/ArticleCard.js`)

**Purpose**: Reusable card component for displaying articles with engagement tracking.

**Props**:
- `article` (object, required): Article data object
  - `id`: String - Article ID
  - `title`: String - Article title
  - `excerpt`: String - Article excerpt
  - `date`: Date/Timestamp - Publication date
  - `category`: String - Article category
  - `imageUrl`: String - Featured image URL
- `index` (number, optional): Index for animation delay (default: 0)

**Features**:
- **Engagement Tracking**: Automatically tracks views, displays likes/comments
- **Like Functionality**: Users can like/unlike articles
- **Real-time Updates**: Engagement counts update via Firestore
- **Category Badges**: Color-coded category indicators
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: Framer Motion entrance animations

**State Management**:
- `isLiked`: Boolean - Whether current user has liked
- `likesCount`: Number - Total likes count
- `commentsCount`: Number - Total comments count
- `viewsCount`: Number - Total views count
- `loading`: Boolean - Loading state for engagement data

**Data Flow**:
```
Component mounts
    ↓
useEffect triggers
    ↓
getArticleEngagement(articleId) called
    ↓
checkArticleLike(articleId) called
    ↓
State updated with engagement data
    ↓
Component re-renders with counts
```

**Functions Used**:
- `getArticleEngagement(articleId)`: Fetches aggregated engagement stats
- `checkArticleLike(articleId)`: Checks if user has liked article
- `toggleArticleLike(articleId)`: Toggles like status
- `trackArticleView(articleId)`: Tracks article view (called on card click)

**Category Colors**:
```javascript
{
  'systemic-shifts': 'bg-teal-500',
  'jukris-lens': 'bg-cyan-500',
  'upstreambuzz': 'bg-blue-500',
  'petronas-2.0': 'bg-indigo-500',
  'trending': 'bg-pink-500'
}
```

**Example Usage**:
```jsx
<ArticleCard 
  article={{
    id: 'article-1',
    title: 'Article Title',
    excerpt: 'Article excerpt...',
    date: new Date(),
    category: 'systemic-shifts',
    imageUrl: '/images/article.jpg'
  }}
  index={0}
/>
```

---

#### 5. ArticleFilters Component (`src/components/ArticleFilters.js`)

**Purpose**: Category filtering component for articles page.

**Features**:
- **Category Buttons**: Clickable category filters
- **Active State**: Highlights active filter
- **Smooth Transitions**: Animated filter changes
- **All Categories**: Option to show all articles

**Props**:
- `categories` (array): Available categories
- `activeCategory` (string): Currently active category
- `onCategoryChange` (function): Callback when category changes

---

### Dropbox Components

#### 6. SystemicShiftsDropbox Component (`src/components/SystemicShiftsDropbox.js`)

**Purpose**: Display and manage story submissions with AI-generated content and image generation.

**Key Features**:
- **Story Display**: Paginated list of story submissions
- **AI Content**: Shows AI-generated writeups and infographic concepts
- **Image Generation**: Displays generated images with loading states
- **Real-time Updates**: Firestore listeners for live updates
- **Pagination**: Advanced pagination with page jumping
- **Download Options**: Download writeups and visuals

**State Management**:
- `submissions`: Array of story documents
- `loading`: Boolean - Loading state
- `currentPage`: Number - Current page number
- `totalDocs`: Number - Total document count
- `isLoggedIn`: Boolean - User authentication state
- `downloadMenuOpen`: String/null - Which submission's menu is open

**Pagination System**:
- **Page Snapshots**: Stores Firestore query snapshots for each page
- **Navigation Methods**:
  - First page: Direct query
  - Next page: Uses `startAfter(lastVisible)`
  - Previous page: Uses stored snapshot
  - Jump to page: Navigates sequentially from closest known page

**Helper Functions**:
```javascript
// Check if AI generation is in progress
isGenerating(sub) {
  const hasNoAnalysis = sub.submittedAt && !sub.analysisTimestamp;
  const imagePending = sub.analysisTimestamp && 
                       (sub.aiGeneratedImageUrl === "Pending local generation" || 
                        !sub.aiGeneratedImageUrl || 
                        !sub.aiGeneratedImageUrl.startsWith('http'));
  return hasNoAnalysis || imagePending;
}
```

**Data Flow**:
```
Component mounts
    ↓
fetchSubmissions('first') called
    ↓
Firestore query executed
    ↓
Submissions state updated
    ↓
onSnapshot listener attached (real-time updates)
    ↓
Component displays stories
    ↓
User navigates pages
    ↓
fetchSubmissions('next'/'prev'/'jump') called
    ↓
New submissions loaded
```

**Loading States**:
- **GeneratingIndicator**: Shows spinner when AI content is generating
- **Image Pending**: Shows "Pending local generation" message
- **Image Loading**: Displays loading state until image URL is available

**Example Story Document Structure**:
```javascript
{
  id: 'story-id',
  storyTitle: 'Story Title',
  submittedAt: Timestamp,
  analysisTimestamp: Timestamp, // When AI analysis completed
  aiGeneratedWriteup: 'AI-generated writeup text...',
  aiInfographicConcept: {
    prompt: 'Image generation prompt...',
    style: 'infographic'
  },
  aiGeneratedImageUrl: 'https://storage.googleapis.com/...', // or "Pending local generation"
  imageGeneratedAt: Timestamp,
  imageGeneratedLocally: true
}
```

---

### NexusGPT Components

#### 7. ChatInterface Component (`src/components/ChatInterface.js`)

**Purpose**: Reusable chat interface component for NexusGPT and other chatbot implementations.

**Props**:
- `chatFunctionUrl` (string, required): URL of the chatbot Cloud Function

**Features**:
- **Message History**: Maintains conversation history
- **Loading States**: Shows typing indicator while waiting for response
- **Suggestions**: Displays follow-up question suggestions
- **Citations**: Shows document citations for RAG responses
- **Auto-scroll**: Automatically scrolls to latest message
- **Clear Chat**: Button to reset conversation

**State Management**:
- `chatInput`: String - Current input text
- `chatHistory`: Array - Conversation messages
- `isChatLoading`: Boolean - Loading state
- `suggestions`: Array - Follow-up suggestions

**Message Structure**:
```javascript
{
  role: 'user' | 'ai',
  content: 'Message text',
  timestamp: Date,
  citations?: Array, // For AI messages with RAG
  suggestions?: Array // For AI messages
}
```

**Functions**:
- `handleChatSubmit()`: Sends message to Cloud Function
- `handleSuggestionClick()`: Uses suggestion as new message
- `handleClearChat()`: Resets conversation history

**Example Usage**:
```jsx
<ChatInterface 
  chatFunctionUrl="https://askchatbot-el2jwxb5bq-uc.a.run.app"
/>
```

---

### ULearn Components

#### 8. PodcastGenerator Component (`src/components/PodcastGenerator.js`)

**Purpose**: Generate AI-powered podcast scripts and audio from topics.

**Features**:
- **Topic Input**: Text input for podcast topic
- **Context Input**: Optional additional context
- **Progress Tracking**: Shows generation progress steps
- **Audio Playback**: Built-in audio player
- **Save to Firestore**: Save generated podcasts
- **Download**: Download audio file

**State Management**:
- `topic`: String - Podcast topic
- `context`: String - Additional context
- `generating`: Boolean - Generation in progress
- `progress`: String - Current progress message
- `podcast`: Object - Generated podcast data
- `playing`: Boolean - Audio playback state
- `audioUrl`: String - Audio file URL
- `saving`: Boolean - Save operation in progress

**Generation Flow**:
```
User enters topic
    ↓
Click "Generate Podcast"
    ↓
POST to generatePodcast Cloud Function
    ↓
Progress updates:
  - "Generating podcast outline..."
  - "Creating script..."
  - "Generating audio..."
    ↓
Response received with script and audioUrl
    ↓
Podcast state updated
    ↓
Audio player displayed
```

**Podcast Data Structure**:
```javascript
{
  script: 'Podcast script text...',
  audioUrl: 'https://storage.googleapis.com/...',
  topic: 'Topic name',
  context: 'Additional context',
  generatedAt: Timestamp
}
```

**Cloud Function Integration**:
- Endpoint: `https://generatepodcast-el2jwxb5bq-uc.a.run.app`
- Method: POST
- Request Body: `{ topic, context }`
- Response: `{ status, script, audioUrl }`

---

### MeetX Components

#### 9. MeetingEditor Component (`src/components/MeetX/MeetingEditor.js`)

**Purpose**: Create and edit meetings with AI-powered insights.

**Features**:
- **Meeting Form**: Title, date, notes input
- **File Upload**: Upload meeting files (PDF, DOCX, TXT)
- **AI Processing**: Extract text from files
- **AI Insights**: Generate summaries and action items
- **Real-time Preview**: See insights as they generate

**State Management**:
- `title`: String - Meeting title
- `content`: String - Meeting notes/content
- `fileUploading`: Boolean - File upload in progress
- `processing`: Boolean - AI processing in progress
- `insights`: Object - AI-generated insights

**AI Insights Structure**:
```javascript
{
  summary: 'Meeting summary...',
  actionItems: [
    { item: 'Action 1', assignee: 'Person', dueDate: '2025-01-15' }
  ],
  insights: 'Key insights...',
  alignmentWarnings: [],
  zombieTasks: []
}
```

---

### Upstream Gallery Components

#### 10. UpstreamGallery Component (`src/components/UpstreamGallery.js`)

**Purpose**: Image gallery with AI-powered categorization and tagging.

**Features**:
- **Category Filtering**: Filter images by category
- **Pagination**: Navigate through image pages
- **Image Upload**: Upload new images with metadata
- **AI Analysis**: Automatic tag and description generation
- **Search**: Search images by tags/description

**Categories**:
```javascript
['All', 'Stock Images', 'Events', 'Team Photos', 'Infographics', 'Operations', 'Facilities']
```

**State Management**:
- `images`: Array - Current page images
- `selectedCategory`: String - Active category filter
- `currentPage`: Number - Current page number
- `totalDocs`: Number - Total image count
- `showUploadForm`: Boolean - Upload form visibility
- `uploading`: Boolean - Upload in progress
- `analyzing`: Boolean - AI analysis in progress

**Upload Flow**:
```
User selects file
    ↓
Upload to Firebase Storage
    ↓
Create Firestore document
    ↓
Optional: AI analysis (analyzeImage Cloud Function)
    ↓
Tags and description added
    ↓
Image appears in gallery
```

**Pagination**:
- Uses same snapshot-based pagination as Dropbox
- 12 images per page
- Supports page jumping

---

### Knowledge Base Components

#### 11. KnowledgeBaseInjector Component (`src/components/KnowledgeBaseInjector.js`)

**Purpose**: Add documents to the knowledge base for RAG functionality.

**Features**:
- **Manual Entry**: Type or paste document content
- **File Upload**: Upload PDF or DOCX files
- **Auto-extraction**: Extract text from uploaded files
- **Category Selection**: Assign document category
- **Tag Management**: Add tags for better searchability
- **Embedding Generation**: Automatically generates embeddings

**Form Fields**:
- `title`: Document title
- `content`: Document content (textarea)
- `category`: Dropdown selection
- `tags`: Comma-separated tags
- `source`: Source identifier
- `sourceUrl`: Optional source URL

**Categories**:
```javascript
['systemic-shifts', 'mindset-behaviour', 'upstream-target', 
 'petronas-info', 'upstream', 'articles', 'general']
```

**Cloud Functions Used**:
- `injectKnowledgeBase`: For manual entry
- `uploadKnowledgeBase`: For file uploads

**Data Flow**:
```
User enters/uploads document
    ↓
POST to Cloud Function
    ↓
Document saved to Firestore
    ↓
Embedding generated (if not exists)
    ↓
Document available for RAG search
```

---

### StatsX Components

**Note**: StatsX components are documented in detail in `public/StatsXNotes/STATSX_IMPLEMENTATION.md`. Key components include:

- **StatsDashboard**: Main dashboard container
- **MetricCard**: Reusable metric display card
- **TrendChart**: Trend visualization with forecasting
- **AnomalyDetector**: Statistical anomaly detection
- **ArticleEngagement**: Article analytics widget
- **DataGenerator**: Fake data generation tool

See `STATSX_IMPLEMENTATION.md` for complete documentation.

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

**Used in:** 
- `src/app/nexusgpt/page.js`
- `src/components/MiniChatWidget.js`

**Description:** NexusGPT chatbot with RAG (Retrieval-Augmented Generation) retrieval from knowledge base

**Secrets:** 
- `GOOGLE_GENAI_API_KEY`
- `OPENROUTER_API_KEY`

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
  "reply": "Portfolio High-Grading is a strategic approach...",
  "suggestions": [
    "Tell me more about Portfolio High-Grading",
    "What are the key benefits?"
  ],
  "citations": [
    {
      "title": "Portfolio High-Grading Strategy",
      "sourceUrl": "https://...",
      "category": "systemic-shifts",
      "similarity": 0.85
    }
  ]
}
```

**How It Works**:
1. Receives user message
2. Generates query embedding using OpenRouter
3. Searches knowledge base using cosine similarity
4. Retrieves top 5 most relevant documents
5. Builds context string from documents
6. Enhances system prompt with context
7. Calls Gemini/OpenRouter LLM
8. Returns answer with citations

**Error Handling**:
- Returns error message if RAG retrieval fails
- Falls back to general knowledge if no documents found
- Handles API rate limits gracefully

##### 2. submitStory (Legacy - Replaced by Local API)
**Endpoint:** `POST /submitStory` or `https://submitstory-el2jwxb5bq-uc.a.run.app`  
**Status:** ⚠️ DEPRECATED - Replaced by local API route  
**Used in:** No longer used by frontend  
**Note:** Frontend now uses `/api/submit-story` local Next.js API route instead

##### 2a. Local Story Submission API

**Endpoint:** `POST /api/submit-story` (local Next.js API route)

**Status:** ✅ Active - Used by frontend

**Used in:** `src/components/SubmitStories.js`

**Location:** `src/app/api/submit-story/route.js`

**Description:** Handles story submission form with file uploads locally

**Request:** Multipart form data

**Form Fields**:
- `name`: String - Submitter's name
- `department`: String - Department
- `storyTitle`: String - Story title
- `story`: String - Story content
- `keyShifts`: Array - Selected key shifts
- `focusAreas`: Array - Selected focus areas
- `desiredMindset`: String - Desired mindset
- `alignsWithShifts`: Boolean - Alignment flag
- `acknowledgement`: Boolean - Acknowledgement checkbox
- `writeUp`: File - Write-up document (optional)
- `visuals`: File[] - Visual files (optional)

**Response:**
```json
{
  "success": true,
  "message": "Story submitted successfully!",
  "storyId": "story-id-123"
}
```

**Side Effects**:
1. Uploads files to Firebase Storage
2. Creates document in `stories` collection
3. Sets `aiGeneratedImageUrl: "Pending local generation"`
4. Triggers `analyzeStorySubmission` Firestore trigger

**Error Handling**:
- Validates required fields
- Handles file upload errors
- Returns specific error messages

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
Generate query embedding using OpenRouter
    ↓
Search knowledge base using cosine similarity
    ↓
Retrieve top 5 most relevant documents
    ↓
Build context string from documents
    ↓
Enhance system prompt with context
    ↓
Call LLM (Gemini/OpenRouter) with enhanced prompt
    ↓
LLM generates answer using context
    ↓
Extract citations from retrieved documents
    ↓
Return answer with citations and suggestions
    ↓
Display in UI with citation links
```

### Article Engagement Flow

```
User views article
    ↓
ArticleCard component mounts
    ↓
trackArticleView(articleId) called
    ↓
Create/update articleEngagement document
    ↓
Increment views count
    ↓
Create analytics event
    ↓
User likes article
    ↓
toggleArticleLike(articleId) called
    ↓
Check if user already liked (articleLikes collection)
    ↓
If not liked:
  - Create articleLikes document
  - Increment articleEngagement likes count
If already liked:
  - Delete articleLikes document
  - Decrement articleEngagement likes count
    ↓
User adds comment
    ↓
addArticleComment(articleId, userName, commentText) called
    ↓
Create articleComments document
    ↓
Increment articleEngagement comments count
    ↓
StatsX ArticleEngagement widget updates
    ↓
Real-time UI updates via Firestore listeners
```

## User Flows

### 1. Story Submission Flow

1. User navigates to Submit Story page (`/submit-story`)
2. Fills out submission form:
   - Name, department, story title
   - Story content
   - Key shifts, focus areas, desired mindset
   - Upload write-up and visuals (optional)
3. Submits form
4. Form data sent to `/api/submit-story` (local API route)
5. Files uploaded to Firebase Storage
6. Story saved to Firestore `stories` collection
7. `analyzeStorySubmission` trigger fires automatically
8. AI generates writeup (saves immediately to Firestore)
9. AI generates infographic concept
10. User can view writeup immediately in Dropbox
11. Local image generator detects story needing image
12. Image generated locally using GPU
13. Image uploaded to Storage
14. Firestore updated with image URL
15. Frontend updates via Firestore listener
16. User sees image in Dropbox

### 2. NexusGPT Chat Flow

1. User navigates to NexusGPT page (`/nexusgpt`)
2. Types question in chat input
3. Question sent to `askChatbot` Cloud Function
4. Function generates query embedding
5. RAG system searches knowledge base
6. Top 5 relevant documents retrieved
7. Context built from documents
8. System prompt enhanced with context
9. LLM (Gemini/OpenRouter) generates answer
10. Citations extracted from retrieved documents
11. Answer displayed with citations
12. Follow-up suggestions shown
13. User can click citations to view source documents

### 3. Article Engagement Flow

1. User browses Articles page (`/articles`)
2. Sees article cards with engagement metrics (views, likes, comments)
3. Clicks on article
4. View tracked automatically via `trackArticleView()`
5. Article detail page loads
6. User can like article (heart button)
7. Like count updates in real-time
8. User can add comment
9. Comment appears immediately
10. StatsX ArticleEngagement widget shows aggregated data
11. Real-time updates via Firestore listeners

### 4. StatsX Analytics Flow

1. User navigates to StatsX page (`/statsx`)
2. Dashboard loads with initial data (server-side fetch)
3. Various widgets display metrics:
   - Pulse Widget (4 key metrics)
   - Trend Chart (with forecasting)
   - Anomaly Detector
   - Story Analytics
   - Meeting Analytics
   - Engagement Analytics
   - Knowledge Base Analytics
   - Article Engagement
4. User can filter data (cross-filtering)
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

## Library Functions

### Analytics Library (`src/lib/analytics.js`)

**Purpose**: Comprehensive analytics tracking system for page views, user interactions, and article engagement.

#### Core Functions

##### `trackPageView(pagePath, pageTitle, metadata)`
**Purpose**: Track page view events  
**Parameters**:
- `pagePath` (string): The path of the page viewed
- `pageTitle` (string): The title of the page
- `metadata` (object, optional): Additional metadata

**Returns**: Promise (void)  
**Side Effects**: Creates document in `analytics` collection

**Example**:
```javascript
await trackPageView('/articles', 'Articles Page', { category: 'content' });
```

**Stored Data**:
```javascript
{
  type: 'page_view',
  pagePath: '/articles',
  pageTitle: 'Articles Page',
  userId: 'user-id',
  timestamp: Timestamp,
  metadata: { category: 'content' },
  userAgent: 'Mozilla/5.0...',
  referrer: 'https://...'
}
```

---

##### `trackEvent(eventName, elementId, metadata)`
**Purpose**: Track custom interaction events  
**Parameters**:
- `eventName` (string): Name of the event (e.g., 'button_click', 'link_click')
- `elementId` (string): ID or identifier of the element
- `metadata` (object, optional): Additional metadata

**Example**:
```javascript
await trackEvent('button_click', 'submit-story-btn', { formType: 'story' });
```

---

##### `trackArticleView(articleId, metadata)`
**Purpose**: Track article view and update engagement metrics  
**Parameters**:
- `articleId` (string): Article ID
- `metadata` (object, optional): Additional metadata

**Side Effects**:
- Creates/updates `articleEngagement` document
- Increments views count
- Creates analytics event

**Example**:
```javascript
await trackArticleView('article-123', { category: 'systemic-shifts' });
```

---

##### `toggleArticleLike(articleId)`
**Purpose**: Toggle like status for an article  
**Parameters**:
- `articleId` (string): Article ID

**Returns**: Promise<boolean> - New like status (true if liked, false if unliked)

**Side Effects**:
- Creates/deletes `articleLikes` document
- Updates `articleEngagement` likes count

**Example**:
```javascript
const isLiked = await toggleArticleLike('article-123');
```

---

##### `checkArticleLike(articleId)`
**Purpose**: Check if current user has liked an article  
**Parameters**:
- `articleId` (string): Article ID

**Returns**: Promise<boolean> - True if user has liked

**Example**:
```javascript
const hasLiked = await checkArticleLike('article-123');
```

---

##### `addArticleComment(articleId, commentText, userName)`
**Purpose**: Add a comment to an article  
**Parameters**:
- `articleId` (string): Article ID
- `commentText` (string): Comment text
- `userName` (string): User's name

**Returns**: Promise<string> - Comment document ID

**Side Effects**:
- Creates `articleComments` document
- Updates `articleEngagement` comments count

**Example**:
```javascript
const commentId = await addArticleComment(
  'article-123',
  'Great article!',
  'John Doe'
);
```

---

##### `getArticleEngagement(articleId)`
**Purpose**: Get aggregated engagement statistics for an article  
**Parameters**:
- `articleId` (string): Article ID

**Returns**: Promise<object>
```javascript
{
  views: 150,
  likes: 25,
  comments: 8
}
```

**Example**:
```javascript
const engagement = await getArticleEngagement('article-123');
console.log(`Views: ${engagement.views}, Likes: ${engagement.likes}`);
```

---

##### `getArticleComments(articleId, limitCount)`
**Purpose**: Get comments for an article  
**Parameters**:
- `articleId` (string): Article ID
- `limitCount` (number, optional): Maximum comments to return (default: 50)

**Returns**: Promise<Array> - Array of comment objects

**Example**:
```javascript
const comments = await getArticleComments('article-123', 20);
```

---

##### `getArticleEngagementStats()`
**Purpose**: Get aggregated engagement statistics for all articles  
**Returns**: Promise<object>
```javascript
{
  totalArticles: 50,
  totalViews: 5000,
  totalLikes: 250,
  totalComments: 100
}
```

**Example**:
```javascript
const stats = await getArticleEngagementStats();
```

---

##### `trackArticleInteraction(articleId, interactionType, metadata)`
**Purpose**: Track article interactions (likes, comments)  
**Parameters**:
- `articleId` (string): Article ID
- `interactionType` (string): 'like' or 'comment'
- `metadata` (object, optional): Additional metadata

**Example**:
```javascript
await trackArticleInteraction('article-123', 'like', { source: 'article-card' });
```

---

### Firebase Configuration (`src/lib/firebase.js`)

**Purpose**: Firebase initialization and configuration.

**Exports**:
- `db`: Firestore database instance
- `storage`: Firebase Storage instance
- `auth`: Firebase Authentication instance

**Configuration**:
- Reads from environment variables (`.env.local`)
- Initializes Firebase app with config
- Sets up Firestore, Storage, and Auth instances

---

## Usage Guides

### Setting Up Local Development

#### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd systemicshiftsver2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

#### 2. Firebase Configuration
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore, Storage, and Authentication
3. Copy config values to `.env.local`
4. Set up Firestore security rules
5. Configure Storage rules

#### 3. Local Image Generator Setup
```powershell
cd python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Set up Firebase credentials
# Option 1: Service account key
# Download from Firebase Console → Project Settings → Service Accounts
# Save as firebase-key.json in python/ folder

# Option 2: gcloud auth
gcloud auth application-default login

# Set Hugging Face token
$env:HF_API_TOKEN="your_token_here"

# Run generator
python local_image_generator.py
```

#### 4. Start Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

---

### Using Story Submission

#### Step-by-Step Guide

1. **Navigate to Submit Story Page**
   - Go to `/submit-story`
   - Or click "Submit Stories" in header

2. **Fill Out Form**
   - Enter your name and department
   - Enter story title
   - Write or paste story content
   - Select key shifts (multiple allowed)
   - Select focus areas (multiple allowed)
   - Choose desired mindset
   - Indicate alignment with shifts

3. **Upload Files** (Optional)
   - **Write-up**: Upload document file
   - **Visuals**: Upload image files (multiple allowed)

4. **Submit**
   - Click "Submit Story"
   - Form data sent to `/api/submit-story`
   - Files uploaded to Firebase Storage
   - Story saved to Firestore

5. **View Results**
   - Navigate to `/nexushub/dropbox`
   - Find your story in the list
   - AI writeup appears immediately
   - Image generation happens asynchronously (if local generator running)

---

### Using NexusGPT

#### How to Ask Questions

1. **Navigate to NexusGPT**
   - Go to `/nexusgpt`
   - Or click "NexusGPT" in header

2. **Type Your Question**
   - Enter question in input field
   - Press Enter or click send button

3. **View Response**
   - AI answer appears with citations
   - Follow-up suggestions shown below
   - Click suggestions to ask follow-up questions

4. **Understanding Citations**
   - Citations show source documents
   - Similarity score indicates relevance
   - Click to view source (if URL provided)

#### Tips for Better Results

- **Be Specific**: More specific questions get better answers
- **Use Keywords**: Include relevant terms from knowledge base
- **Ask Follow-ups**: Use suggested questions for deeper exploration
- **Check Citations**: Verify information from source documents

---

### Using Knowledge Base Injector

#### Adding Documents Manually

1. **Open Injector**
   - Click "Inject Knowledge Base" button (usually in NexusGPT page)
   - Modal opens with form

2. **Fill Form**
   - **Title**: Document title
   - **Content**: Paste or type document content
   - **Category**: Select appropriate category
   - **Tags**: Comma-separated tags
   - **Source**: Source identifier
   - **Source URL**: Optional URL

3. **Submit**
   - Click "Inject Document"
   - Document saved to Firestore
   - Embedding generated automatically
   - Available for RAG search immediately

#### Uploading Files

1. **Select File**
   - Click "Choose File"
   - Select PDF or DOCX file

2. **Extract Content** (Optional)
   - Click "Extract and Fill"
   - Text extracted from file
   - Form auto-filled with content

3. **Review and Submit**
   - Review extracted content
   - Add/edit metadata
   - Click "Upload and Inject"
   - File uploaded to Storage
   - Text extracted and saved to knowledge base

---

### Using Podcast Generator

1. **Navigate to ULearn**
   - Go to `/ulearn/podcast`

2. **Enter Topic**
   - Type podcast topic in input field
   - Add optional context

3. **Generate**
   - Click "Generate Podcast"
   - Progress updates shown:
     - "Generating podcast outline..."
     - "Creating script..."
     - "Generating audio..."

4. **Review Results**
   - Script displayed in text area
   - Audio player appears
   - Play/pause controls available

5. **Save Podcast** (Optional)
   - Click "Save Podcast"
   - Saved to Firestore
   - Accessible in "My Podcasts"

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Failed to fetch" Error on Story Submission

**Symptoms**: Error message when submitting story form

**Possible Causes**:
- Local API route not running
- Firebase configuration missing
- Network connectivity issues

**Solutions**:
1. **Check Development Server**: Ensure `npm run dev` is running
2. **Verify Firebase Config**: Check `.env.local` has all required values
3. **Check Network Tab**: Look for specific error in browser DevTools
4. **Verify API Route**: Check `src/app/api/submit-story/route.js` exists

**Debug Steps**:
```javascript
// Check browser console for errors
// Check Network tab for failed requests
// Verify Firebase config in .env.local
```

---

#### 2. Images Not Generating

**Symptoms**: Story shows "Pending local generation" but image never appears

**Possible Causes**:
- Local image generator not running
- Firebase credentials not configured
- Hugging Face token missing
- GPU/CUDA issues

**Solutions**:
1. **Check Generator Status**: Ensure `python local_image_generator.py` is running
2. **Verify Credentials**: Check Firebase service account key exists
3. **Check Token**: Verify `HF_API_TOKEN` environment variable is set
4. **Check Logs**: Look for errors in generator console output

**Debug Steps**:
```powershell
# Check if generator is running
Get-Process python

# Verify environment variable
echo $env:HF_API_TOKEN

# Check Firebase credentials
Test-Path "python\firebase-key.json"
```

---

#### 3. NexusGPT Not Responding

**Symptoms**: Chat interface shows loading but no response

**Possible Causes**:
- Cloud Function not deployed
- API keys missing
- Knowledge base empty
- Network issues

**Solutions**:
1. **Check Function Status**: Verify `askChatbot` function is deployed
2. **Verify API Keys**: Check Firebase secrets are set
3. **Check Knowledge Base**: Ensure documents exist in `knowledgeBase` collection
4. **Check Network**: Verify Cloud Function URL is accessible

**Debug Steps**:
```javascript
// Check browser console for errors
// Test Cloud Function directly:
fetch('https://askchatbot-el2jwxb5bq-uc.a.run.app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
```

---

#### 4. Article Engagement Not Tracking

**Symptoms**: Views, likes, comments not updating

**Possible Causes**:
- Analytics functions not called
- Firestore rules blocking writes
- User ID not set

**Solutions**:
1. **Check Function Calls**: Verify `trackArticleView()` is called
2. **Check Firestore Rules**: Ensure rules allow writes to `analytics` collection
3. **Check User ID**: Verify `sessionStorage.getItem('userId')` returns value

**Debug Steps**:
```javascript
// Check if tracking is called
console.log('Tracking article view...');
await trackArticleView('article-123');

// Check Firestore rules
// Verify sessionStorage has userId
console.log(sessionStorage.getItem('userId'));
```

---

#### 5. Pagination Not Working

**Symptoms**: Can't navigate between pages in Dropbox or Gallery

**Possible Causes**:
- Firestore query errors
- Missing indexes
- Snapshot storage issues

**Solutions**:
1. **Check Firestore Indexes**: Ensure composite indexes exist
2. **Check Console Errors**: Look for Firestore query errors
3. **Verify Query Structure**: Check query uses correct field names

**Debug Steps**:
```javascript
// Check browser console for Firestore errors
// Verify collection name matches
// Check field names in queries
```

---

#### 6. Hydration Errors

**Symptoms**: React hydration mismatch warnings in console

**Possible Causes**:
- Server/client HTML mismatch
- Date/time rendering differences
- Conditional rendering based on client-only state

**Solutions**:
1. **Use `mounted` State**: Check component uses `mounted` flag for client-only rendering
2. **Avoid Date Formatting**: Use `useEffect` for date formatting
3. **Check Conditional Rendering**: Ensure server and client render same initial HTML

**Example Fix**:
```javascript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Only render dynamic content after mount
{mounted && <DynamicComponent />}
```

---

### Performance Issues

#### Slow Page Loads

**Solutions**:
1. **Enable Code Splitting**: Use dynamic imports for heavy components
2. **Optimize Images**: Use Next.js Image component
3. **Reduce Bundle Size**: Remove unused dependencies
4. **Enable Caching**: Configure proper cache headers

#### Slow Firestore Queries

**Solutions**:
1. **Add Indexes**: Create composite indexes for complex queries
2. **Limit Results**: Use `limit()` in queries
3. **Cache Data**: Store frequently accessed data in state
4. **Optimize Queries**: Reduce number of queries per page

---

## Future Enhancements

### Planned Features

- [ ] **Unit and Integration Tests**: Jest and React Testing Library
- [ ] **E2E Testing**: Playwright for end-to-end testing
- [ ] **Performance Monitoring**: Real User Monitoring (RUM)
- [ ] **Error Tracking**: Sentry integration for error tracking
- [ ] **Analytics Dashboard**: Enhanced analytics visualization
- [ ] **A/B Testing Framework**: Built-in A/B testing capabilities
- [ ] **Offline Support**: Service workers for offline functionality
- [ ] **Push Notifications**: Browser push notifications
- [ ] **Advanced Search**: Full-text search across all content
- [ ] **Export Functionality**: Export data as CSV/JSON

### Technical Debt

- [ ] Refactor duplicate code in pagination components
- [ ] Consolidate similar utility functions
- [ ] Improve error handling consistency
- [ ] Add TypeScript for type safety
- [ ] Optimize bundle size further
- [ ] Improve accessibility (WCAG compliance)

---

## Summary

The Systemic Shifts Microsite is a comprehensive platform featuring:

- **AI-Powered Features**: Image generation, podcast creation, chatbot, meeting insights
- **Real-time Analytics**: StatsX dashboard with forecasting and anomaly detection
- **Content Management**: Articles, stories, knowledge base, gallery
- **User Engagement**: Likes, comments, views tracking
- **Local Services**: GPU-accelerated image generation

All components are modular, well-documented, and designed for extensibility. The architecture supports easy addition of new features and integration with external services.

