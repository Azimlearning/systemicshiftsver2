# Stop Next.js development server
# Usage: .\stop-dev.ps1

Write-Host "Stopping Next.js development server..." -ForegroundColor Yellow
Write-Host ""

# Navigate to the project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Find and kill processes using ports 3000 or 3001
$ports = @(3000, 3001)
$killed = $false

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Killing process on port $port (PID: $process)..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        $killed = $true
        Start-Sleep -Seconds 1
    }
}

# Remove lock file if it exists
$lockFile = ".next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "Lock file removed." -ForegroundColor Green
    $killed = $true
}

if ($killed) {
    Write-Host "Dev server stopped successfully." -ForegroundColor Green
} else {
    Write-Host "No dev server found running." -ForegroundColor Gray
}

