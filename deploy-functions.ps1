# Firebase Functions Deployment Script
# Run this script to deploy your updated functions

Write-Host "=== Firebase Functions Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is available
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseCheck = npx --yes firebase-tools --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Firebase CLI not available" -ForegroundColor Red
    exit 1
}
Write-Host "Firebase CLI found!" -ForegroundColor Green
Write-Host ""

# Check login status
Write-Host "Checking authentication..." -ForegroundColor Yellow
$loginCheck = npx --yes firebase-tools login:list 2>&1
if ($loginCheck -match "No authorized accounts") {
    Write-Host "You need to log in to Firebase first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run this command manually in your terminal:" -ForegroundColor Cyan
    Write-Host "  npx firebase-tools login" -ForegroundColor White
    Write-Host ""
    Write-Host "When prompted about Gemini features, answer Y or N" -ForegroundColor Yellow
    Write-Host "Then come back and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or press Enter to continue with login now..." -ForegroundColor Cyan
    Read-Host
    Write-Host "Starting Firebase login..." -ForegroundColor Yellow
    npx firebase-tools login
} else {
    Write-Host "Already logged in!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setting Firebase project..." -ForegroundColor Yellow
npx --yes firebase-tools use systemicshiftv2

Write-Host ""
Write-Host "Deploying functions..." -ForegroundColor Yellow
Write-Host "This will deploy:" -ForegroundColor Cyan
Write-Host "  - submitStory" -ForegroundColor White
Write-Host "  - analyzeStorySubmission" -ForegroundColor White
Write-Host "  - askChatbot" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying..." -ForegroundColor Green
npx --yes firebase-tools deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deployment Successful! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your fixes are now live:" -ForegroundColor Cyan
    Write-Host "  ✓ Safe JSON parsing" -ForegroundColor Green
    Write-Host "  ✓ API key validation" -ForegroundColor Green
    Write-Host "  ✓ Enhanced image generation with style guides" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test by submitting a new story!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "=== Deployment Failed ===" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Yellow
}

