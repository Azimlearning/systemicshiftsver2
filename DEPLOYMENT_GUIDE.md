# Deployment Guide - RAG Knowledge Base System

## Current Status
✅ Code implementation complete
❌ Deployment failed with Eventarc service identity error
⏳ Functions need to be deployed

## Prerequisites

1. **Firebase CLI installed and authenticated**
   ```powershell
   firebase login
   firebase projects:list
   ```

2. **Secrets configured in Firebase**
   ```powershell
   firebase functions:secrets:set OPENROUTER_API_KEY
   firebase functions:secrets:set GOOGLE_GENAI_API_KEY
   ```

## Step 1: Fix Eventarc Service Identity Error

The Eventarc error occurs because Firestore triggers (`onDocumentCreated`) require Eventarc service identity permissions.

### Option A: Grant Permissions via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/systemicshiftv2/settings/iam)
2. Find the service account: `systemicshiftv2@appspot.gserviceaccount.com`
3. Ensure it has these roles:
   - **Cloud Functions Invoker**
   - **Eventarc Event Receiver**
   - **Pub/Sub Publisher** (if using Pub/Sub)

### Option B: Grant Permissions via gcloud CLI

```powershell
# Set project
gcloud config set project systemicshiftv2

# Grant Eventarc permissions to default service account
gcloud projects add-iam-policy-binding systemicshiftv2 `
  --member="serviceAccount:systemicshiftv2@appspot.gserviceaccount.com" `
  --role="roles/eventarc.eventReceiver"

# Grant Pub/Sub permissions (if needed)
gcloud projects add-iam-policy-binding systemicshiftv2 `
  --member="serviceAccount:systemicshiftv2@appspot.gserviceaccount.com" `
  --role="roles/pubsub.publisher"
```

### Option C: Enable Required APIs

```powershell
gcloud services enable eventarc.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
```

## Step 2: Deploy Functions

### Deploy All Functions

```powershell
cd "C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2"
firebase deploy --only functions
```

### Deploy Specific Functions (if needed)

```powershell
# Deploy RAG-related functions only
firebase deploy --only functions:askChatbot,functions:populateKnowledgeBase,functions:generateEmbeddings,functions:injectKnowledgeBase,functions:uploadKnowledgeBase
```

### Verify Deployment

```powershell
firebase functions:list
```

Expected functions:
- ✅ `askChatbot` (with RAG integration)
- ✅ `populateKnowledgeBase`
- ✅ `generateEmbeddings`
- ✅ `injectKnowledgeBase`
- ✅ `uploadKnowledgeBase`
- ✅ `analyzeStorySubmission` (Firestore trigger)

## Step 3: Populate Knowledge Base

After deployment, populate the knowledge base with website content:

### Via HTTP Request

```powershell
# Get the function URL
$functionUrl = "https://us-central1-systemicshiftv2.cloudfunctions.net/populateKnowledgeBase"

# Call the function
Invoke-RestMethod -Uri $functionUrl -Method GET
```

### Via Firebase Console

1. Go to [Cloud Functions](https://console.firebase.google.com/project/systemicshiftv2/functions)
2. Click on `populateKnowledgeBase`
3. Click "Test" tab
4. Send a GET request

### Expected Response

```json
{
  "success": true,
  "message": "Successfully populated knowledge base with X documents",
  "count": X
}
```

## Step 4: Generate Embeddings

After populating the knowledge base, generate vector embeddings:

### Via HTTP Request

```powershell
$functionUrl = "https://us-central1-systemicshiftv2.cloudfunctions.net/generateEmbeddings"
Invoke-RestMethod -Uri $functionUrl -Method GET
```

### Expected Response

```json
{
  "success": true,
  "message": "Successfully generated embeddings for X documents",
  "processed": X
}
```

**Note:** This may take several minutes depending on the number of documents (processes 10 at a time).

## Step 5: Test RAG System

### Test the Chatbot

1. Navigate to the NexusGPT page in your app
2. Ask questions about Systemic Shifts, such as:
   - "What are the key shifts?"
   - "Tell me about portfolio high-grading"
   - "What is PETRONAS 2.0?"

### Verify Citations

- Check that citations appear below responses
- Citations should link to knowledge base sources
- Responses should reference specific knowledge base content

### Check Function Logs

```powershell
# View chatbot logs
firebase functions:log --only askChatbot

# View embedding generation logs
firebase functions:log --only generateEmbeddings
```

## Troubleshooting

### Eventarc Error Persists

1. **Check service account permissions:**
   ```powershell
   gcloud projects get-iam-policy systemicshiftv2 `
     --flatten="bindings[].members" `
     --filter="bindings.members:systemicshiftv2@appspot.gserviceaccount.com"
   ```

2. **Try deploying without the trigger first:**
   - Comment out `analyzeStorySubmission` temporarily
   - Deploy other functions
   - Then deploy the trigger function separately

### Embeddings Not Generated

1. **Check if knowledge base is populated:**
   ```powershell
   # Check Firestore
   # Go to Firebase Console > Firestore Database
   # Look for 'knowledgeBase' collection
   ```

2. **Check API key:**
   ```powershell
   firebase functions:secrets:access OPENROUTER_API_KEY
   ```

### RAG Not Working

1. **Verify embeddings exist:**
   - Check Firestore `knowledgeBase` collection
   - Documents should have an `embedding` field (array of numbers)

2. **Check function logs for errors:**
   ```powershell
   firebase functions:log --only askChatbot --limit 50
   ```

3. **Test retrieval directly:**
   - Check `chatbotRAGRetriever.js` logs
   - Verify similarity search is working

## Next Steps After Deployment

1. ✅ **Monitor function performance** - Check execution times and costs
2. ✅ **Add more content** - Use `injectKnowledgeBase` or `uploadKnowledgeBase` to add more documents
3. ✅ **Update embeddings** - Re-run `generateEmbeddings` when new content is added
4. ✅ **Optimize retrieval** - Adjust `topK` parameter in `askChatbot` if needed

## Quick Reference

### Function URLs (after deployment)

- `askChatbot`: `https://us-central1-systemicshiftv2.cloudfunctions.net/askChatbot`
- `populateKnowledgeBase`: `https://us-central1-systemicshiftv2.cloudfunctions.net/populateKnowledgeBase`
- `generateEmbeddings`: `https://us-central1-systemicshiftv2.cloudfunctions.net/generateEmbeddings`
- `injectKnowledgeBase`: `https://us-central1-systemicshiftv2.cloudfunctions.net/injectKnowledgeBase`
- `uploadKnowledgeBase`: `https://us-central1-systemicshiftv2.cloudfunctions.net/uploadKnowledgeBase`

### Firestore Collections

- `knowledgeBase` - Knowledge base documents with embeddings
- `chatSessions` - Chat conversation history
- `stories` - Story submissions (existing)

