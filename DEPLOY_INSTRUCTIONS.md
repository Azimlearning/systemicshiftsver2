# Deployment Instructions

## Quick Deploy Steps

### Step 1: Login to Firebase (if not already logged in)
Run this command in your terminal:
```bash
npx firebase-tools login
```
- Follow the prompts to authenticate
- Choose "Y" or "N" for Gemini features (optional)

### Step 2: Deploy Functions Only
Once logged in, run:
```bash
npx firebase-tools deploy --only functions
```

This will deploy:
- `submitStory` function
- `analyzeStorySubmission` function  
- `askChatbot` function

### Step 3: Verify Deployment
Check the Firebase Console or logs to confirm the functions are deployed successfully.

---

## What's Being Deployed

### Fixed Issues:
✅ Safe JSON parsing in image generation
✅ API key validation
✅ Enhanced prompts with style guides
✅ Better error handling

### Enhanced Features:
✅ Example infographic style integration
✅ Improved image generation prompts
✅ Complete write-up prompt templates

---

## Troubleshooting

### If you get authentication errors:
1. Make sure you're logged in: `npx firebase-tools login:list`
2. Check your project: `npx firebase-tools projects:list`
3. Set project: `npx firebase-tools use systemicshiftv2`

### If deployment fails:
- Check that you have the required secrets configured:
  - `GOOGLE_GENAI_API_KEY`
  - `OPENROUTER_API_KEY`
- Set secrets: `npx firebase-tools functions:secrets:set GOOGLE_GENAI_API_KEY`

### Monitor Logs:
```bash
npx firebase-tools functions:log
```

---

## Alternative: Manual Deployment

If CLI deployment doesn't work, you can:
1. Go to Firebase Console → Functions
2. Edit functions manually (not recommended for production)
3. Or use GitHub Actions / CI/CD if configured

---

## Post-Deployment Testing

After deployment, test by:
1. Submitting a new story via the form
2. Check the Dropbox to see if AI generation works
3. Verify image generation succeeds (no more JSON errors)
4. Check logs for any remaining issues

