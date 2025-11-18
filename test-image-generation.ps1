# Test script for Hugging Face image generation
# Usage: .\test-image-generation.ps1 -StoryId "hqtLR4153ZhXPlkYdN9w"

param(
    [Parameter(Mandatory=$true)]
    [string]$StoryId
)

# Use the deployed generateImageHf function URL (from Firebase Console)
$functionUrl = "https://generateimagehf-el2jwxb5bq-uc.a.run.app"

Write-Host "Testing Hugging Face image generation" -ForegroundColor Cyan
Write-Host "Function URL: $functionUrl" -ForegroundColor Yellow
Write-Host "Story ID: $StoryId" -ForegroundColor Yellow
Write-Host ""

# Create a test prompt for the infographic
$prompt = "Generate a clean, corporate infographic for PETRONAS Upstream. Use a vertical layout. Color palette must be TEAL and GREEN. Title: `"Decarbonisation at Tiong A: Simple Steps, Big Impact`". Key Metrics: Flaring reduction from 11 MMscf/d to 1.5 MMscf/d; CO2 reduction: 0.21 million tCO2e per year; Cost savings: RM32.19 million annually. Visual Style: Flat design, minimal icons, professional."

$body = @{
    prompt = $prompt
    docId = $StoryId
} | ConvertTo-Json

Write-Host "Sending request..." -ForegroundColor Yellow
Write-Host "This may take 2-5 minutes for image generation..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 600
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    if ($response.image_url) {
        Write-Host "`n✅ Image URL: $($response.image_url)" -ForegroundColor Cyan
        Write-Host "`nCheck your Firestore document '$StoryId' to see the updated aiGeneratedImageUrl field" -ForegroundColor Yellow
        Write-Host "You can also open the image URL in your browser to view it!" -ForegroundColor Yellow
    } elseif ($response.status -eq "ok") {
        Write-Host "`n✅ Image generated successfully!" -ForegroundColor Green
        Write-Host "Check Firestore document for the image URL" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check Firebase Console logs: firebase functions:log --only default:generateImageHf" -ForegroundColor Yellow
    Write-Host "2. Verify the function URL is correct" -ForegroundColor Yellow
    Write-Host "3. Make sure HF_API_TOKEN secret is set in Firebase" -ForegroundColor Yellow
}

