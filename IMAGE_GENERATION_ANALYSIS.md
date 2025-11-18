# Image Generation Issue Analysis

## Problem Summary
The Python image generator service is detecting new submissions but **not generating images** because `aiInfographicConcept` is missing. This means `analyzeStorySubmission` hasn't run yet or failed.

## Current Status (from terminal logs)
```
Document ID: drVVpkoErBJSKugfpain
Title: "Decarbonisation at Tiong A: Simple Steps"
Submitted: 2025-11-17 16:57:19 UTC
Status: hasConcept=False ❌
Result: Skipped (waiting for analyzeStorySubmission)
```

## Expected Flow
1. ✅ User submits story → `submitStory` creates document in Firestore
2. ❌ **Firestore trigger** → `analyzeStorySubmission` should run automatically
3. ❌ `analyzeStorySubmission` generates `aiInfographicConcept` and updates document
4. ⏳ Python script detects concept and generates image

## Root Cause
The `analyzeStorySubmission` Firestore trigger function is either:
- **Not deployed** (most likely)
- **Failing silently** (check logs)
- **Still running** (takes 1-9 minutes)

## Solutions

### Option 1: Check if Function is Deployed
```powershell
# Navigate to functions directory
cd "C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2\functions"

# List deployed functions
firebase functions:list

# Or check Firebase Console
# https://console.firebase.google.com/project/systemicshiftv2/functions
```

### Option 2: Check Function Logs
```powershell
# View recent logs for analyzeStorySubmission
firebase functions:log --only analyzeStorySubmission

# Or check Google Cloud Console
# https://console.cloud.google.com/logs/query?project=systemicshiftv2
# Filter: resource.type="cloud_function" AND resource.labels.function_name="analyzeStorySubmission"
```

### Option 3: Deploy the Function
If the function is not deployed:
```powershell
cd "C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2\functions"
firebase deploy --only functions:analyzeStorySubmission
```

### Option 4: Manually Trigger Analysis
Use the `triggerImageGeneration` function to manually trigger analysis for existing documents:

```powershell
# Update the story ID in trigger-analysis.ps1
$storyId = "drVVpkoErBJSKugfpain"  # Your document ID
$functionUrl = "https://triggerimagegeneration-el2jwxb5bq-uc.a.run.app"

$body = @{
    storyId = $storyId
} | ConvertTo-Json

Invoke-RestMethod -Uri $functionUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 600
```

## Verification Steps

1. **Check if document has concept:**
   - Go to Firebase Console → Firestore
   - Open document `drVVpkoErBJSKugfpain`
   - Check if `aiInfographicConcept` field exists

2. **Check function execution:**
   - Go to Google Cloud Console → Cloud Functions
   - Find `analyzeStorySubmission`
   - Check execution history and logs

3. **Monitor Python script:**
   - Wait for next monitor cycle (30 seconds)
   - Should see: `hasConcept=True` when concept is ready
   - Then image generation will start

## Next Steps

1. **Immediate:** Check Firebase Console to see if `analyzeStorySubmission` is deployed
2. **If not deployed:** Deploy the function
3. **If deployed but not running:** Check logs for errors
4. **Alternative:** Manually trigger analysis using `triggerImageGeneration`

## Expected Timeline

- `analyzeStorySubmission`: 1-9 minutes (generates writeup + concept)
- Image generation: 30 seconds - 5 minutes (depending on API/local model)

Once `aiInfographicConcept` is set, the Python script will automatically detect it and start image generation in the next monitor cycle (30 seconds).

