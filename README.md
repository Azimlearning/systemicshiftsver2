# Systemic Shifts Microsite

A comprehensive Next.js-based microsite for PETRONAS Upstream's Systemic Shifts initiative, featuring AI-powered tools, analytics, and content management.

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
systemicshiftsver2/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utility functions and helpers
├── functions/            # Firebase Cloud Functions (Node.js)
├── functions-python/     # Firebase Cloud Functions (Python)
├── public/               # Static assets
└── Scripts_usage/        # Utility scripts
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- Python 3.9+ (for Python functions)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd systemicshiftsver2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

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
Deploy to Firebase Hosting or Vercel:
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

## Configuration

See `SETUP.md` for detailed setup instructions including:
- Firebase configuration
- API keys setup
- Environment variables
- Local development setup

## Documentation

- `SETUP.md` - Detailed setup and configuration guide
- `TESTING.md` - Testing procedures and checklist
- `SITE_DOCUMENTATION.md` - Full site architecture and API documentation
- `Scripts_usage/README.md` - Utility scripts documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Internal use only - PETRONAS Upstream

## Support

For issues and questions, contact the development team.
