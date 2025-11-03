@echo off
echo ========================================
echo  Firebase Functions Deployment Helper
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Step 1: Login to Firebase
echo Run: npx firebase-tools login
echo.
echo Step 2: Set project
echo Run: npx firebase-tools use systemicshiftv2
echo.
echo Step 3: Deploy
echo Run: npx firebase-tools deploy --only functions
echo.
echo ========================================
echo Press any key to start with login...
pause >nul
npx firebase-tools login

