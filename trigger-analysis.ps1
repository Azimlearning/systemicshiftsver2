# Script to manually trigger analysis for a story
# This will run analyzeStorySubmission to generate aiInfographicConcept
$storyId = "0LJOlNv8fghXHZzJKepw"  # Update with your document ID
$functionUrl = "https://triggerimagegeneration-el2jwxb5bq-uc.a.run.app"

Write-Host "`n🚀 Triggering image generation for story: $storyId" -ForegroundColor Yellow
Write-Host "Function URL: $functionUrl" -ForegroundColor Cyan

$body = @{
    storyId = $storyId
} | ConvertTo-Json

try {
    Write-Host "`nSending POST request..." -ForegroundColor Green
    $response = Invoke-RestMethod -Uri $functionUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 600
    
    Write-Host "`n✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.imageUrl) {
        Write-Host "`n🖼️  Image URL: $($response.imageUrl)" -ForegroundColor Green
    }
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`nCheck logs at:" -ForegroundColor Yellow
$logUrl = "https://console.cloud.google.com/logs/query?project=systemicshiftv2"
Write-Host $logUrl -ForegroundColor Cyan

