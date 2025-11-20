# Test RAG Knowledge Base System
# This script tests the deployed RAG functions

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RAG System Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://us-central1-systemicshiftv2.cloudfunctions.net"

# Test 1: Check if functions are deployed
Write-Host "Test 1: Checking Function Availability..." -ForegroundColor Yellow
Write-Host ""

$functions = @(
    "askChatbot",
    "populateKnowledgeBase",
    "generateEmbeddings"
)

foreach ($func in $functions) {
    $url = "$baseUrl/$func"
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 405) {
            Write-Host "✅ $func is accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $func returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $func is not accessible or not deployed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 2: Populate Knowledge Base
Write-Host "Test 2: Populating Knowledge Base..." -ForegroundColor Yellow
Write-Host ""

$populateUrl = "$baseUrl/populateKnowledgeBase"
try {
    Write-Host "Calling populateKnowledgeBase..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $populateUrl -Method GET -TimeoutSec 300
    
    if ($response.success) {
        Write-Host "✅ Knowledge base populated successfully!" -ForegroundColor Green
        Write-Host "   Documents added: $($response.count)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Population completed with warnings" -ForegroundColor Yellow
        Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to populate knowledge base" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 3: Generate Embeddings
Write-Host "Test 3: Generating Embeddings..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

$embeddingsUrl = "$baseUrl/generateEmbeddings"
try {
    Write-Host "Calling generateEmbeddings..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $embeddingsUrl -Method GET -TimeoutSec 600
    
    if ($response.success) {
        Write-Host "✅ Embeddings generated successfully!" -ForegroundColor Green
        Write-Host "   Documents processed: $($response.processed)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Embedding generation completed with warnings" -ForegroundColor Yellow
        Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to generate embeddings" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 4: Test Chatbot with RAG
Write-Host "Test 4: Testing Chatbot with RAG..." -ForegroundColor Yellow
Write-Host ""

$chatbotUrl = "$baseUrl/askChatbot"
$testQuestions = @(
    "What are the key shifts?",
    "Tell me about portfolio high-grading",
    "What is PETRONAS 2.0?"
)

foreach ($question in $testQuestions) {
    Write-Host "Question: $question" -ForegroundColor Cyan
    try {
        $body = @{
            message = $question
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $chatbotUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 120
        
        Write-Host "✅ Response received" -ForegroundColor Green
        Write-Host "   Reply: $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..." -ForegroundColor White
        
        if ($response.citations -and $response.citations.Count -gt 0) {
            Write-Host "   Citations: $($response.citations.Count)" -ForegroundColor Green
            foreach ($citation in $response.citations) {
                Write-Host "     - $($citation.title) (similarity: $($citation.similarity))" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️  No citations found" -ForegroundColor Yellow
        }
        
        if ($response.suggestions -and $response.suggestions.Count -gt 0) {
            Write-Host "   Suggestions: $($response.suggestions.Count)" -ForegroundColor White
        }
        
    } catch {
        Write-Host "❌ Failed to get response" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Firebase Console logs for detailed information" -ForegroundColor White
Write-Host "2. Test the chatbot in the NexusGPT UI" -ForegroundColor White
Write-Host "3. Verify citations appear in responses" -ForegroundColor White
Write-Host ""

