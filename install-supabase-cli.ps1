# PowerShell script to install Supabase CLI on Windows
Write-Host "Installing Supabase CLI..." -ForegroundColor Green

# Check if Chocolatey is installed
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "Using Chocolatey to install Supabase CLI..." -ForegroundColor Yellow
    choco install supabase -y
} else {
    Write-Host "Chocolatey not found. Please install Supabase CLI manually:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://github.com/supabase/cli/releases" -ForegroundColor Cyan
    Write-Host "2. Download the latest Windows executable" -ForegroundColor Cyan
    Write-Host "3. Add to PATH or run from download location" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or install Chocolatey first:" -ForegroundColor Yellow
    Write-Host "  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor Cyan
}

