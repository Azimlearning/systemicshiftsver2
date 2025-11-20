# Run the local image generator service
# This monitors Firestore and generates images locally using your GPU

Write-Host "`n🚀 Starting Local Image Generator Service" -ForegroundColor Green
Write-Host "`nThis will:" -ForegroundColor Cyan
Write-Host "1. Monitor Firestore for stories needing images" -ForegroundColor White
Write-Host "2. Generate images locally using your GPU" -ForegroundColor White
Write-Host "3. Upload images to Firebase Storage" -ForegroundColor White
Write-Host "4. Update Firestore with image URLs" -ForegroundColor White
Write-Host "`nMake sure you have:" -ForegroundColor Yellow
Write-Host "- HF_API_TOKEN set in environment" -ForegroundColor White
Write-Host "- Firebase credentials configured" -ForegroundColor White
Write-Host "- CUDA/GPU available (recommended)" -ForegroundColor White
Write-Host "`nStarting service..." -ForegroundColor Green

cd "C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\systemicshiftsver2\python"

# Activate venv if it exists
if (Test-Path ".venv\Scripts\Activate.ps1") {
    .\.venv\Scripts\Activate.ps1
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
}

# Check for HF token
if (-not $env:HF_API_TOKEN) {
    Write-Host "`n⚠️  HF_API_TOKEN not set!" -ForegroundColor Yellow
    Write-Host "Set it with: `$env:HF_API_TOKEN='your_token_here'" -ForegroundColor White
    $token = Read-Host "Enter your Hugging Face token (or press Enter to skip)"
    if ($token) {
        $env:HF_API_TOKEN = $token
    }
}

# Run the service
python local_image_generator.py

