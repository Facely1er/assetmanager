# Simple Migration Application Script
# Applies migrations using psql if available, otherwise provides instructions

$dbUrl = "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres"

Write-Host "Applying Database Migrations" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check for psql
$psqlAvailable = $false
try {
    $null = Get-Command psql -ErrorAction Stop
    $psqlAvailable = $true
    $psqlVersion = psql --version 2>&1
    Write-Host "psql found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "psql not found in PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install psql:" -ForegroundColor Yellow
    Write-Host "  1. Download PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "  2. Or use manual method: Copy migrations from migrations-ready/ folder" -ForegroundColor Cyan
    Write-Host "     to Supabase SQL Editor: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Get project root
$currentDir = (Get-Location).Path
if ($currentDir -like "*\scripts") {
    $projectRoot = Split-Path -Parent $currentDir
} else {
    $projectRoot = $currentDir
}

$migrations = @(
    "supabase\migrations\20250801112702_cold_firefly.sql",
    "supabase\migrations\20250801114506_odd_flower.sql",
    "supabase\migrations\20250125000000_dependency_manager_features.sql"
)

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Yellow
Write-Host ""

$index = 1
$successCount = 0
$failCount = 0

foreach ($mig in $migrations) {
    $migrationPath = Join-Path $projectRoot $mig
    
    if (-not (Test-Path $migrationPath)) {
        Write-Host "[$index/3] File not found: $migrationPath" -ForegroundColor Red
        $failCount++
        $index++
        continue
    }
    
    Write-Host "[$index/3] Applying: $mig" -ForegroundColor Cyan
    
    $result = psql $dbUrl -f $migrationPath 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "  [OK] Migration applied successfully" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  [FAILED] Migration failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
    $index++
}

Write-Host "============================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Successful: $successCount" -ForegroundColor $(if ($successCount -gt 0) { "Green" } else { "Red" })
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($successCount -eq 3) {
    Write-Host "All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify tables in Supabase Table Editor" -ForegroundColor White
    Write-Host "  2. Get Supabase anon key for deployment" -ForegroundColor White
    Write-Host "  3. Deploy to Netlify" -ForegroundColor White
} else {
    Write-Host "Some migrations failed. Check errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Apply migrations manually via Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "  https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new" -ForegroundColor Cyan
}

Write-Host ""

