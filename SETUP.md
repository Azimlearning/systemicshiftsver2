# Setup Guide

Complete setup instructions for the Systemic Shifts Microsite project.

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Python**: Version 3.9 or higher (for Python Cloud Functions)
- **Firebase CLI**: Latest version
- **Git**: For version control

### Installation Commands

#### Node.js and npm
Download and install from [nodejs.org](https://nodejs.org/)

#### Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Python
Download and install from [python.org](https://www.python.org/downloads/)

## Project Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd systemicshiftsver2
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Firebase Functions (Node.js)
```bash
cd functions
npm install
cd ..
```

#### Firebase Functions (Python)
```bash
cd functions-python
pip install -r requirements.txt
cd ..
```

### 3. Firebase Configuration

#### Initialize Firebase Project
```bash
firebase init
```

Select:
- Firestore
- Functions
- Hosting
- Storage

#### Link to Existing Project
If you have an existing Firebase project:
```bash
firebase use <project-id>
```

### 4. Environment Variables

#### Frontend (.env.local)
Create `systemicshiftsver2/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_TRIGGER_IMAGE_GENERATION_URL=https://us-central1-your-project.cloudfunctions.net/triggerImageGeneration
```

#### Firebase Functions Secrets
Set up secrets for Cloud Functions:
```bash
# Gemini API Key
firebase functions:secrets:set GEMINI_API_KEY

# OpenRouter API Key
firebase functions:secrets:set OPENROUTER_API_KEY

# Hugging Face API Token
firebase functions:secrets:set HF_API_TOKEN
```

### 5. API Keys Setup

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Set as `GEMINI_API_KEY` secret in Firebase

#### OpenRouter API
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get API key from dashboard
3. Set as `OPENROUTER_API_KEY` secret in Firebase

#### Hugging Face API
1. Sign up at [Hugging Face](https://huggingface.co/)
2. Create access token
3. Set as `HF_API_TOKEN` secret in Firebase

## Local Development

### Start Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Run Firebase Functions Locally
```bash
# Node.js functions
cd functions
npm run serve

# Python functions (requires additional setup)
cd functions-python
# See Python-specific setup below
```

### Firestore Emulator (Optional)
```bash
firebase emulators:start --only firestore
```

## Python Functions Setup

### Virtual Environment
```bash
cd functions-python
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Local Testing
```bash
# Use Firebase Functions Framework
pip install functions-framework
functions-framework --target=generateImageHfPython --port=8080
```

## Local Image Generator Setup

The project uses a **local image generator** service that runs on your machine to generate images using your GPU, then uploads them to Firebase Storage. This is preferred over Cloud Functions for better performance and cost efficiency.

### Prerequisites
- Python 3.9 or higher
- NVIDIA GPU (recommended) or CPU
- Firebase service account key

### Setup Steps

#### 1. Install Python Dependencies
```powershell
cd python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Install PyTorch with CUDA (if you have NVIDIA GPU)
- Go to: https://pytorch.org/get-started/locally/
- Select your CUDA version
- Example command:
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### 3. Set Up Firebase Authentication

**Option A: Service Account Key (Recommended)**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-key.json` in the `python` folder
4. Set environment variable:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2\python\firebase-key.json"
```

**Option B: Application Default Credentials**
```powershell
gcloud auth application-default login
```

#### 4. Set Hugging Face Token
```powershell
$env:HF_API_TOKEN="your_huggingface_token_here"
```

### Running the Local Image Generator

**Using PowerShell Script (Recommended):**
```powershell
cd python
.\run_local_generator.ps1
```

**Manual Start:**
```powershell
cd python
.\.venv\Scripts\activate
$env:HF_API_TOKEN="your_token"
python local_image_generator.py
```

### How It Works

1. **Monitors Firestore** - Checks every 30 seconds for stories with `aiInfographicConcept` but no `aiGeneratedImageUrl`
2. **Generates images locally** - Uses your GPU (much faster than Cloud Functions!)
3. **Uploads to Firebase Storage** - Saves the generated image
4. **Updates Firestore** - Sets `aiGeneratedImageUrl` so the frontend can display it

### Benefits

- ✅ Uses your local GPU (fast!)
- ✅ No 5GB model download in Cloud Functions
- ✅ No Cloud Functions deployment issues
- ✅ Works offline (once model is downloaded)
- ✅ Full control over generation parameters

### Notes

- The service runs continuously - keep it running in a terminal
- First run will download the model (~5GB) - this only happens once
- Images are generated asynchronously after story submission
- The frontend will automatically show images once they're generated

## Firebase Configuration Files

### firebase.json
Ensure your `firebase.json` includes:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs18"
    },
    {
      "source": "functions-python",
      "codebase": "python",
      "runtime": "python311"
    }
  ],
  "hosting": {
    "public": ".next",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Firestore Rules
Set up appropriate security rules in `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add your rules here
  }
}
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase
```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:askChatbot
```

### Deploy Python Functions
```bash
cd functions-python
firebase deploy --only functions:generateImageHfPython
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

#### Firebase Functions Not Deploying
- Check Firebase CLI is logged in: `firebase login`
- Verify project: `firebase use`
- Check function dependencies are installed

#### Environment Variables Not Loading
- Ensure `.env.local` is in the root directory
- Restart development server after adding variables
- Variables must start with `NEXT_PUBLIC_` for client-side access

#### Python Functions Errors
- Ensure Python 3.9+ is installed
- Activate virtual environment
- Install all requirements: `pip install -r requirements.txt`

## Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Edit code
   - Test locally
   - Commit changes

3. **Test Before Deploying**
   ```bash
   npm run build
   npm run lint
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For setup issues, contact the development team or refer to the main README.md file.

