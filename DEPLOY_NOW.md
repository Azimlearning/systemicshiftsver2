# Quick Deployment Steps

## Step 1: Open PowerShell or Command Prompt
Navigate to the project folder:
```
cd "C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2"
```

## Step 2: Login to Firebase
Run this command:
```
npx firebase-tools login
```

**What happens:**
- It will ask if you want to enable Gemini features → Answer `Y` or `N`
- It will provide a URL or try to open your browser
- Copy the URL if browser doesn't open
- Complete authentication in browser
- Return to terminal when done

## Step 3: Set Your Project
```
npx firebase-tools use systemicshiftv2
```

## Step 4: Deploy Functions
```
npx firebase-tools deploy --only functions
```

## That's it! ✅

Your updated functions will be deployed with:
- ✅ Fixed JSON parsing errors
- ✅ API key validation
- ✅ Enhanced image generation with style guides

---

## Alternative: Use Firebase Console
If CLI doesn't work, you can:
1. Go to https://console.firebase.google.com
2. Select project: systemicshiftv2
3. Go to Functions
4. Edit and redeploy manually (not recommended)

