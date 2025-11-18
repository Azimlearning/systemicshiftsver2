# Test the Python function directly to verify model download works
$pythonFunctionUrl = "https://generateimagehfpython-el2jwxb5bq-uc.a.run.app"
$storyId = "b0kaM9Tt4oDp2OMcsXSs"

# Simple test prompt
$testPrompt = "Generate a clean, corporate infographic for PETRONAS Upstream. Use a vertical layout. Color palette must be TEAL and GREEN. Title: 'Decarbonisation at Tiong A: Simple Steps, Big Impact'. Key Metrics: Flaring reduction from 11 MMscf/d to 1.5 MMscf/d; 0.21 million tCO2e reduction per year. Visual Style: Flat design, minimal icons, professional."

Write-Host "`n🧪 Testing Python Function (Model Download Test)" -ForegroundColor Yellow
Write-Host "Function URL: $pythonFunctionUrl" -ForegroundColor Cyan
Write-Host "Story ID: $storyId" -ForegroundColor Cyan
Write-Host "`n⚠️  This will download the ~5GB model on first call (takes 2-5 minutes)" -ForegroundColor Yellow
Write-Host "`nSending request..." -ForegroundColor Green

$body = @{
    prompt = $testPrompt
    docId = $storyId
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $pythonFunctionUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 600
    
    Write-Host "`n✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.image_url) {
        Write-Host "`n🖼️  Image URL: $($response.image_url)" -ForegroundColor Green
        Write-Host "`n✅ Model download and image generation completed!" -ForegroundColor Green
    }
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    Write-Host "`nCheck logs at:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/logs/query?project=systemicshiftv2" -ForegroundColor Cyan
}

