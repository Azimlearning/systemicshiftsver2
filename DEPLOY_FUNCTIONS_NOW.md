# 🚀 Deploy Functions to Fix Image Generation Error

## The Problem
You're seeing "Unexpected end of JSON input" because the **old code is still running** in Firebase Functions. We need to deploy the fixed code.

## Quick Deploy (3 Steps)

### Step 1: Open Terminal/PowerShell
Navigate to your project:
```powershell
cd "C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2"
```

### Step 2: Login to Firebase
```powershell
npx firebase-tools login
```
- Opens browser for authentication
- Answer `Y` or `N` for Gemini features
- Wait for "Success! Logged in as..."

### Step 3: Deploy Functions
```powershell
npx firebase-tools use systemicshiftv2
npx firebase-tools deploy --only functions
```

**This will deploy:**
- ✅ Fixed JSON parsing (no more "Unexpected end of JSON input")
- ✅ API key validation  
- ✅ Enhanced image generation with style guides
- ✅ Better error handling

---

## What Gets Deployed

### Functions Updated:
1. **submitStory** - Form submission handler
2. **analyzeStorySubmission** - AI content generation (the one with the error)
3. **askChatbot** - NexusGPT chat handler

### Fixes Included:
- ✅ Fixed response stream reading (was reading twice - causing JSON error)
- ✅ Safe JSON parsing with proper error handling
- ✅ API key validation before use
- ✅ Enhanced prompts with example infographic styles

---

## After Deployment

1. **Test with a new submission** - The error should be gone
2. **Check Firebase Console** → Functions → Logs for any issues
3. **Old submissions** will still show the error (they were processed with old code)
4. **New submissions** will work correctly

---

## Troubleshooting

### If deployment fails:

**Check secrets are set:**
```powershell
npx firebase-tools functions:secrets:access GOOGLE_GENAI_API_KEY
npx firebase-tools functions:secrets:access OPENROUTER_API_KEY
```

**If secrets are missing, set them:**
```powershell
npx firebase-tools functions:secrets:set GOOGLE_GENAI_API_KEY
npx firebase-tools functions:secrets:set OPENROUTER_API_KEY
```

**Monitor deployment:**
- Watch the terminal output
- Check for any error messages
- Deployment usually takes 2-5 minutes

---

## Verify Deployment Success

After deployment completes, you should see:
```
✔  Deploy complete!
```

Then test by submitting a new story - the image generation should work!

