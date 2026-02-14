<#
.SYNOPSIS
    Starts DeviceRevive (backend + frontend).
.DESCRIPTION
    1. Creates a Python virtual environment (if needed) and installs dependencies.
    2. Starts the FastAPI backend on port 8000.
    3. Installs Node.js dependencies (if needed) and starts the Next.js frontend on port 3000.
    4. Opens the browser to http://localhost:3000.
.NOTES
    Prerequisites: Python 3.10+, Node.js 18+, npm
    Make sure scraper/.env exists with your GROQ_API_KEY (copy from scraper/.env.example).
#>

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DeviceRevive" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Check prerequisites ──────────────────────────────────────────────────────
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $pythonCmd = $cmd
        break
    }
}
if (-not $pythonCmd) {
    Write-Host "[ERROR] Python not found. Install Python 3.10+ and add to PATH." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Python: $pythonCmd" -ForegroundColor Green

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Install Node.js 18+ and add to PATH." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green

# ── Check .env file ──────────────────────────────────────────────────────────
$envFile = Join-Path $root "scraper\.env"
$envExample = Join-Path $root "scraper\.env.example"
if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "[WARN] Created scraper/.env from .env.example. Edit it and add your GROQ_API_KEY!" -ForegroundColor Yellow
        Write-Host "       Get a free key at: https://console.groq.com/keys" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter after adding your GROQ_API_KEY to scraper/.env"
    } else {
        Write-Host "[ERROR] scraper/.env not found. Copy scraper/.env.example to scraper/.env and add your GROQ_API_KEY." -ForegroundColor Red
        exit 1
    }
}

# ── Setup Python venv + install deps ─────────────────────────────────────────
$venvDir = Join-Path $root ".venv"
if (-not (Test-Path (Join-Path $venvDir "Scripts\python.exe"))) {
    Write-Host "[SETUP] Creating Python virtual environment..." -ForegroundColor Yellow
    & $pythonCmd -m venv $venvDir
}
$venvPython = Join-Path $venvDir "Scripts\python.exe"
Write-Host "[SETUP] Installing Python dependencies..." -ForegroundColor Yellow
& $venvPython -m pip install -q --upgrade pip
& $venvPython -m pip install -q -r (Join-Path $root "scraper\requirements.txt")
Write-Host "[OK] Python dependencies installed." -ForegroundColor Green

# ── Install Node.js dependencies ─────────────────────────────────────────────
if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Host "[SETUP] Installing Node.js dependencies..." -ForegroundColor Yellow
    Push-Location $root
    npm install
    Pop-Location
}
Write-Host "[OK] Node.js dependencies installed." -ForegroundColor Green

# ── Kill any existing processes on ports 8000 and 3000 ────────────────────────
Write-Host "[CLEANUP] Freeing ports 8000 and 3000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1

# ── Start the FastAPI backend ─────────────────────────────────────────────────
Write-Host "[START] Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
$backendJob = Start-Process -NoNewWindow -PassThru -FilePath $venvPython -ArgumentList @(
    "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"
) -WorkingDirectory (Join-Path $root "scraper")

# Wait for backend to be ready
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $null = Invoke-RestMethod "http://localhost:8000/health" -TimeoutSec 2
        $ready = $true
        break
    } catch { }
}
if ($ready) {
    Write-Host "[OK] Backend is running." -ForegroundColor Green
} else {
    Write-Host "[WARN] Backend may still be starting..." -ForegroundColor Yellow
}

# ── Start the Next.js frontend ────────────────────────────────────────────────
Write-Host "[START] Starting frontend on http://localhost:3000 ..." -ForegroundColor Cyan
$frontendJob = Start-Process -NoNewWindow -PassThru -FilePath "npm" -ArgumentList @(
    "run", "dev"
) -WorkingDirectory $root

Start-Sleep -Seconds 5
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  App is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Yellow

# Open browser
Start-Process "http://localhost:3000"

# Wait for either process to exit
try {
    while (-not $backendJob.HasExited -and -not $frontendJob.HasExited) {
        Start-Sleep -Seconds 2
    }
} finally {
    # Cleanup on exit
    if (-not $backendJob.HasExited) { Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue }
    if (-not $frontendJob.HasExited) { Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "`nServers stopped." -ForegroundColor Yellow
}
