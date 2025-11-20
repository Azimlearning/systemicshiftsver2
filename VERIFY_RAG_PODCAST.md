# How to Verify RAG Integration in Podcast Generator

## Quick Verification Steps

### 1. Check Cloud Functions Logs

After generating a podcast, check the Firebase Console logs for these messages:

**Look for:**
- `[generatePodcast] ===== RAG RETRIEVAL START =====`
- `[generatePodcast] Query: "..."`
- `[generatePodcast] Retrieved X relevant documents from knowledge base`
- `[generatePodcast] Document 1: "..." (similarity: X.XXXX)`

**If you see:**
- `No relevant documents found in knowledge base` → Documents may not have embeddings
- `RAG retrieval failed` → Check error message in logs

### 2. Check Response Metadata

The podcast generation response now includes `ragMetadata`:

```json
{
  "success": true,
  "podcast": {...},
  "ragMetadata": {
    "used": true/false,
    "documentsFound": 0-5,
    "topDocuments": [...],
    "query": "...",
    "contextLength": 0-3000,
    "error": null or error message
  }
}
```

**In browser console, after generating a podcast:**
```javascript
// Check the response
const response = await fetch('...', {...});
const data = await response.json();
console.log('RAG Metadata:', data.ragMetadata);
```

### 3. Test RAG Retrieval Directly

Use the test endpoint to verify RAG works:

**Endpoint:** `https://testpodcastrag-el2jwxb5bq-uc.a.run.app` (or your deployed URL)

**Request:**
```bash
curl -X POST https://testpodcastrag-el2jwxb5bq-uc.a.run.app \
  -H "Content-Type: application/json" \
  -d '{"topic": "Systemic Shift #8: Operate it Right"}'
```

**Or use PowerShell:**
```powershell
$body = @{
    topic = "Systemic Shift #8: Operate it Right"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://testpodcastrag-el2jwxb5bq-uc.a.run.app" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Response will show:**
- How many documents were found
- Document titles and similarity scores
- Knowledge base status (total docs, docs with embeddings)

### 4. Verify Knowledge Base Has Documents with Embeddings

**Option A: Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Open `knowledgeBase` collection
3. Check if documents exist
4. Open a document and verify it has an `embedding` field (array of numbers)

**Option B: Using the test endpoint**
The test endpoint returns `knowledgeBaseStatus` showing:
- Total documents in collection
- How many sample documents have embeddings

### 5. Generate Embeddings if Missing

If documents exist but don't have embeddings:

**Call the generateEmbeddings function:**
```bash
curl -X POST https://generateembeddings-el2jwxb5bq-uc.a.run.app
```

Or visit the URL in browser (if GET is supported).

This will:
- Find all documents without embeddings
- Generate embeddings for them
- Store embeddings in Firestore

**Note:** This may take time if you have many documents.

## Common Issues and Solutions

### Issue: "No relevant documents found"

**Possible causes:**
1. Knowledge base collection is empty
   - **Solution:** Upload documents using `uploadKnowledgeBase` or `injectKnowledgeBase`

2. Documents exist but have no embeddings
   - **Solution:** Run `generateEmbeddings` function

3. Query doesn't match any documents (low similarity)
   - **Solution:** Try a different topic or check if your documents are relevant

### Issue: "RAG retrieval failed"

**Check logs for:**
- API key errors → Verify OPENROUTER_API_KEY is set
- Embedding generation errors → Check API quota/limits
- Firestore errors → Check permissions

### Issue: Documents found but not used in podcast

**Check:**
1. Look at `ragMetadata.contextLength` - should be > 0
2. Check logs for "RAG context included in prompt: YES"
3. Verify the prompt includes the knowledge base section

## Debugging Checklist

- [ ] Knowledge base collection has documents
- [ ] Documents have `embedding` field (array of numbers)
- [ ] Test endpoint returns documents for a known topic
- [ ] Cloud Functions logs show RAG retrieval happening
- [ ] Response includes `ragMetadata` with `used: true`
- [ ] `ragMetadata.documentsFound > 0`
- [ ] Generated podcast mentions facts from knowledge base

## Example: Verifying a Specific Topic

1. **Generate a podcast** with topic: "Systemic Shift #8: Operate it Right"
2. **Check response** for `ragMetadata`
3. **Check logs** for document titles found
4. **Verify** the podcast script mentions specific details from your knowledge base documents
5. **Compare** with a podcast generated without RAG (if you have old ones)

## Need More Help?

Check the Cloud Functions logs in Firebase Console:
- Functions → generatePodcast → Logs
- Look for `[generatePodcast]` and `[ChatbotRAG]` prefixes
- These show detailed step-by-step RAG retrieval process

