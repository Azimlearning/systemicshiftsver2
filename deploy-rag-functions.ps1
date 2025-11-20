# Deploy RAG Knowledge Base Functions
# This script helps deploy the RAG system functions with proper error handling

param(
    [switch]$FixEventarc,
    [switch]$DeployOnly,
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RAG Functions Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if gcloud CLI is installed (for Eventarc fix)
if ($FixEventarc) {
    try {
        $gcloudVersion = gcloud --version 2>&1 | Select-Object -First 1
        Write-Host "✅ gcloud CLI found" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  gcloud CLI not found. Eventarc fix will be skipped." -ForegroundColor Yellow
        Write-Host "   Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
        $FixEventarc = $false
    }
}

# Navigate to project directory
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "Project directory: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Step 1: Fix Eventarc permissions (if requested)
if ($FixEventarc) {
    Write-Host "Step 1: Fixing Eventarc Service Identity Permissions..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Set project
        gcloud config set project systemicshiftv2 2>&1 | Out-Null
        
        # Grant Eventarc permissions
        Write-Host "Granting Eventarc Event Receiver role..." -ForegroundColor Cyan
        gcloud projects add-iam-policy-binding systemicshiftv2 `
            --member="serviceAccount:systemicshiftv2@appspot.gserviceaccount.com" `
            --role="roles/eventarc.eventReceiver" `
            --condition=None 2>&1 | Out-Null
        
        Write-Host "✅ Eventarc permissions granted" -ForegroundColor Green
        
        # Enable required APIs
        Write-Host "Enabling required APIs..." -ForegroundColor Cyan
        gcloud services enable eventarc.googleapis.com --quiet 2>&1 | Out-Null
        gcloud services enable pubsub.googleapis.com --quiet 2>&1 | Out-Null
        
        Write-Host "✅ APIs enabled" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "⚠️  Could not fix Eventarc permissions automatically" -ForegroundColor Yellow
        Write-Host "   Please fix manually using the DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Step 2: Deploy functions
if (-not $TestOnly) {
    Write-Host "Step 2: Deploying Functions..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if user wants to deploy specific functions
    $deployCommand = "firebase deploy --only functions"
    
    if ($DeployOnly) {
        Write-Host "Deploying RAG-related functions only..." -ForegroundColor Cyan
        $deployCommand = "firebase deploy --only functions:askChatbot,functions:populateKnowledgeBase,functions:generateEmbeddings,functions:injectKnowledgeBase,functions:uploadKnowledgeBase"
    }
    
    Write-Host "Running: $deployCommand" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        Invoke-Expression $deployCommand
        Write-Host ""
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Check if Eventarc permissions are set (use -FixEventarc flag)" -ForegroundColor Yellow
        Write-Host "2. Verify secrets are configured: firebase functions:secrets:access OPENROUTER_API_KEY" -ForegroundColor Yellow
        Write-Host "3. Check deployment logs above for specific errors" -ForegroundColor Yellow
        exit 1
    }
}

# Step 3: Verify deployment
Write-Host ""
Write-Host "Step 3: Verifying Deployment..." -ForegroundColor Yellow
Write-Host ""

try {
    $functions = firebase functions:list 2>&1
    Write-Host $functions
    
    # Check for key functions
    $requiredFunctions = @("askChatbot", "populateKnowledgeBase", "generateEmbeddings")
    $missingFunctions = @()
    
    foreach ($func in $requiredFunctions) {
        if ($functions -notmatch $func) {
            $missingFunctions += $func
        }
    }
    
    if ($missingFunctions.Count -eq 0) {
        Write-Host ""
        Write-Host "✅ All required functions are deployed!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Missing functions: $($missingFunctions -join ', ')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify functions list" -ForegroundColor Yellow
}

# Step 4: Next steps
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Populate Knowledge Base:" -ForegroundColor Yellow
Write-Host "   Invoke-RestMethod -Uri 'https://us-central1-systemicshiftv2.cloudfunctions.net/populateKnowledgeBase' -Method GET" -ForegroundColor White
Write-Host ""
Write-Host "2. Generate Embeddings:" -ForegroundColor Yellow
Write-Host "   Invoke-RestMethod -Uri 'https://us-central1-systemicshiftv2.cloudfunctions.net/generateEmbeddings' -Method GET" -ForegroundColor White
Write-Host ""
Write-Host "3. Test the Chatbot:" -ForegroundColor Yellow
Write-Host "   Navigate to NexusGPT page and ask questions about Systemic Shifts" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

