# Quick start script for Next.js development server
# Usage: .\start-dev.ps1

Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host ""

# Navigate to the project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check for existing Next.js dev server and clean up
$lockFile = ".next\dev\lock"
if (Test-Path $lockFile) {
    Write-Host "Found existing lock file. Cleaning up..." -ForegroundColor Yellow
    
    # Try to find and kill processes using ports 3000 or 3001
    $ports = @(3000, 3001)
    foreach ($port in $ports) {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                   Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "Killing process on port $port (PID: $process)..." -ForegroundColor Yellow
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
    
    # Remove lock file
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "Lock file removed." -ForegroundColor Green
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the development server
Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev

