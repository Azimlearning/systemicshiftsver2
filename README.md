# Systemic Shifts Microsite

A comprehensive Next.js-based microsite for PETRONAS Upstream's Systemic Shifts initiative, featuring AI-powered tools, analytics, and content management. Built during an internship project.

**Live demo:** [petronas-systemic-shifts-microsite.vercel.app](https://petronas-systemic-shifts-microsite.vercel.app)

> **Note on AI features:** The AI-powered tools (NexusGPT, podcast generation, image generation, meeting insights) call Firebase Cloud Functions that require an active billing plan to run. In this public showcase, those functions may be offline; the UI is designed to fail gracefully with a clear message rather than a broken screen. See [docs/SITE_BREAKDOWN.md](docs/SITE_BREAKDOWN.md) for the full architecture.

## Overview

The Systemic Shifts Microsite is a digital platform designed to support PETRONAS Upstream's transformation journey toward PETRONAS 2.0 by 2035. The platform provides:

- **AI-Powered Features**: NexusGPT chatbot, image generation, podcast creation, and meeting organization
- **Analytics Dashboard**: StatsX provides comprehensive analytics and insights
- **Content Management**: Article hub, story submissions, and knowledge base management
- **Collaboration Tools**: Upstream Gallery, collaterals, and meeting management

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: React Icons, Framer Motion
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend
- **Firebase**: Firestore (database), Storage, Cloud Functions
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting / Vercel

### AI Services
- **LLM**: Google Gemini, OpenRouter
- **Embeddings**: OpenAI, OpenRouter
- **Image Generation**: Hugging Face Inference API
- **Text-to-Speech**: Various TTS APIs

### Development Tools
- **Language**: JavaScript/TypeScript, Python
- **Package Manager**: npm
- **Version Control**: Git

## Key Features

### 1. NexusGPT
AI-powered chatbot with RAG (Retrieval-Augmented Generation) capabilities that answers questions using the knowledge base.

### 2. StatsX Analytics Dashboard
Comprehensive analytics dashboard tracking:
- Story submissions and engagement
- Meeting analytics
- Article views, likes, and comments
- Knowledge base usage
- AI insights and predictions

### 3. Systemic Shifts Dropbox
Submission system for stories with:
- AI-generated writeups
- AI-generated infographic images
- Asynchronous image generation with progress tracking

### 4. ULearn
AI-powered podcast generation from knowledge base content.

### 5. MeetX
Meeting organization and management with AI-powered insights.

### 6. Upstream Gallery
Image gallery with AI-powered categorization and search.

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utility functions and helpers
├── functions/             # Firebase Cloud Functions (Node.js)
├── functions-python/      # Firebase Cloud Functions (Python)
├── python/                # Local GPU-accelerated image generator service
├── public/                # Static assets
└── docs/                  # Architecture and testing documentation
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- Python 3.9+ (for Python functions)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Azimlearning/PETRONAS-Upstream-Systemic-Shifts-Microsite-AI.git
cd PETRONAS-Upstream-Systemic-Shifts-Microsite-AI
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in the values in `.env.local`. See [SETUP.md](SETUP.md) for where to get each key.

4. Run development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Firebase Functions

### Node.js Functions
Located in `functions/` directory:
- `analyzeStorySubmission` - Analyzes story submissions and generates AI content
- `askChatbot` - NexusGPT chatbot endpoint
- `generateImageHf` - Image generation using Hugging Face
- `generatePodcast` - Podcast generation
- `triggerImageGeneration` - Manual image generation trigger

### Python Functions
Located in `functions-python/` directory:
- `generateImageHfPython` - Python-based image generation
- `analyzeImagePython` - Image analysis

## Deployment

### Frontend

Deployed via Vercel (connected to this repo's `main` branch). Manual deploy:

```bash
npm run build
vercel --prod
```

Firebase Hosting is also an option if you prefer to keep frontend and backend on the same platform:

```bash
npm run build
firebase deploy --only hosting
```

### Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

Requires an active Blaze (pay-as-you-go) billing plan on the Firebase project for Cloud Functions v2 and Secret Manager.

## Configuration

See [SETUP.md](SETUP.md) for detailed setup instructions including:

- Firebase configuration
- API keys setup
- Environment variables
- Local development setup

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup and configuration guide
- [docs/SITE_BREAKDOWN.md](docs/SITE_BREAKDOWN.md) - Full site architecture and API documentation
- [docs/TESTING.md](docs/TESTING.md) - Testing procedures and checklist

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Internal use only - PETRONAS Upstream

## Support

For issues and questions, contact the development team.
