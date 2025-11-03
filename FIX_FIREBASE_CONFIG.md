# Fix Firebase Configuration Error

## Problem
You're seeing: `Permission denied: Consumer 'projects/undefined' has been suspended`

This means your Firebase project ID is `undefined` because environment variables are missing.

## Solution: Add Firebase Configuration

### Step 1: Get Your Firebase Config

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select project: **systemicshiftv2**

2. **Get Web App Configuration**
   - Click the **gear icon** (⚙️) next to "Project Overview"
   - Select **Project Settings**
   - Scroll down to **"Your apps"** section
   - If you see a web app, click the **</>** (web) icon to view config
   - If no web app exists:
     - Click **"Add app"**
     - Choose **Web** (</> icon)
     - Register app (name it anything, e.g., "Systemic Shifts Web")
     - You'll see the config values

3. **Copy the Config Values**
   You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "systemicshiftv2.firebaseapp.com",
     projectId: "systemicshiftv2",
     storageBucket: "systemicshiftv2.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

### Step 2: Create .env.local File

1. **In your project root** (`systemicshiftsver2`), create a file named `.env.local`

2. **Copy this template and fill in your values:**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-from-console
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=systemicshiftv2.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=systemicshiftv2
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=systemicshiftv2.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. **Replace the placeholder values** with the actual values from Firebase Console

### Step 3: Restart Development Server

After creating `.env.local`:
1. **Stop** the current dev server (Ctrl+C)
2. **Restart** it:
   ```powershell
   npm run dev
   ```

The error should be fixed! ✅

---

## Quick Check: Verify Project Status

If the error persists after adding config, check if your Firebase project is active:

1. Go to https://console.firebase.google.com
2. Select **systemicshiftv2**
3. Check for any warnings or suspension notices
4. Make sure billing is enabled (if required)

---

## Security Note

- ✅ `.env.local` is already in `.gitignore` (it won't be committed)
- ❌ Never commit your Firebase config to Git
- ✅ Keep your API keys secure

---

## Still Having Issues?

If the project shows as "suspended":
1. Check Firebase Console for suspension reasons
2. Verify billing is set up (if required)
3. Check project quotas and limits
4. Contact Firebase support if needed

