# PowerShell script to check Text-to-Speech API status
# This requires you to be authenticated with gcloud or have a service account

Write-Host "Checking Text-to-Speech API status for project: systemicshiftv2" -ForegroundColor Cyan
Write-Host ""

# Option 1: Check via Google Cloud Console
Write-Host "To check/enable the API manually:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com?project=systemicshiftv2" -ForegroundColor White
Write-Host "2. If API enabled is shown, you are good!" -ForegroundColor Green
Write-Host "3. If not, click the Enable button" -ForegroundColor Yellow
Write-Host ""

# Option 2: Check if gcloud is available
$gcloudPath = Get-Command gcloud -ErrorAction SilentlyContinue
if ($gcloudPath) {
    Write-Host "gcloud CLI found! Checking API status..." -ForegroundColor Green
    Write-Host ""
    
    # Set the project
    gcloud config set project systemicshiftv2
    
    # Check if API is enabled
    $apiStatus = gcloud services list --enabled --filter="name:texttospeech.googleapis.com" --format="value(name)" 2>&1
    
    if ($apiStatus -match "texttospeech") {
        Write-Host "Text-to-Speech API is ENABLED" -ForegroundColor Green
    } else {
        Write-Host "Text-to-Speech API is NOT enabled" -ForegroundColor Red
        Write-Host ""
        Write-Host "To enable it, run:" -ForegroundColor Yellow
        Write-Host "  gcloud services enable texttospeech.googleapis.com --project=systemicshiftv2" -ForegroundColor White
    }
} else {
    Write-Host "gcloud CLI not found. Please use the web console method above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install gcloud CLI:" -ForegroundColor Cyan
    Write-Host "  https://cloud.google.com/sdk/docs/install" -ForegroundColor White
}

Write-Host ""
Write-Host "After enabling the API, you may need to:" -ForegroundColor Cyan
Write-Host "1. Wait 1-2 minutes for the API to be fully enabled" -ForegroundColor White
Write-Host "2. Ensure your Cloud Function has the necessary IAM permissions" -ForegroundColor White
Write-Host "3. Redeploy your function if needed" -ForegroundColor White
