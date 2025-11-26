# CyberSoluce-AssetManager - Apply Migrations via Supabase CLI
# This script applies database migrations using Supabase CLI

param(
    [string]$ProjectRef = "uvdrwbmhmtgacwzujfzc",
    [switch]$DryRun = $false
)

Write-Host "🗄️  Applying Database Migrations via Supabase CLI" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is available
Write-Host "🔍 Checking for Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Supabase CLI:" -ForegroundColor Yellow
        Write-Host "  npm install -g supabase" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Or use psql instead:" -ForegroundColor Yellow
        Write-Host "  Run: .\scripts\apply-migrations-cli.ps1" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ Supabase CLI not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host ""
Write-Host "🔐 Checking Supabase authentication..." -ForegroundColor Yellow
try {
    $whoami = supabase projects list 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Not logged in. Please login..." -ForegroundColor Yellow
        Write-Host "   Run: supabase login" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Or use psql instead:" -ForegroundColor Yellow
        Write-Host "   Run: .\scripts\apply-migrations-cli.ps1" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "✅ Authenticated with Supabase" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Please login to Supabase first" -ForegroundColor Yellow
    Write-Host "   Run: supabase login" -ForegroundColor Cyan
    exit 1
}

# Get project root
$currentDir = (Get-Location).Path
if ($currentDir -like "*\scripts") {
    $projectRoot = Split-Path -Parent $currentDir
} else {
    $projectRoot = $currentDir
}

$migrationsDir = Join-Path $projectRoot "supabase\migrations"

Write-Host ""
Write-Host "📁 Project directory: $projectRoot" -ForegroundColor Gray
Write-Host "📁 Migrations directory: $migrationsDir" -ForegroundColor Gray
Write-Host "🔗 Project reference: $ProjectRef" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $migrationsDir)) {
    Write-Host "❌ Migrations directory not found: $migrationsDir" -ForegroundColor Red
    exit 1
}

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Migration files in order
$migrations = @(
    @{
        File = "20250801112702_cold_firefly.sql"
        Name = "Migration 1: Reports"
    },
    @{
        File = "20250801114506_odd_flower.sql"
        Name = "Migration 2: Organizations"
    },
    @{
        File = "20250125000000_dependency_manager_features.sql"
        Name = "Migration 3: All Features"
    }
)

Write-Host "📋 Applying migrations to project: $ProjectRef" -ForegroundColor Yellow
Write-Host ""

$migrationIndex = 1
$successCount = 0
$failCount = 0

foreach ($migration in $migrations) {
    $migrationFile = Join-Path $migrationsDir $migration.File
    
    if (-not (Test-Path $migrationFile)) {
        Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
        $failCount++
        continue
    }
    
    Write-Host "[$migrationIndex/3] Applying: $($migration.Name)" -ForegroundColor Cyan
    Write-Host "   File: $($migration.File)" -ForegroundColor Gray
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would apply: $migrationFile" -ForegroundColor Yellow
        $successCount++
    } else {
        try {
            # Read migration content
            $migrationContent = Get-Content $migrationFile -Raw
            
            # Apply migration using Supabase CLI
            # Note: Supabase CLI doesn't have a direct migration apply command for remote projects
            # We'll use db push or link the project and use migration commands
            
            Write-Host "   ⚠️  Supabase CLI remote migration apply requires project linking" -ForegroundColor Yellow
            Write-Host "   💡 Using alternative method: psql or manual application recommended" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "   For now, please use:" -ForegroundColor Yellow
            Write-Host "   - psql method: .\scripts\apply-migrations-cli.ps1" -ForegroundColor Cyan
            Write-Host "   - Manual method: Copy to Supabase SQL Editor" -ForegroundColor Cyan
            Write-Host ""
            
            # Alternative: Use Supabase db push if project is linked
            # This would require: supabase link --project-ref $ProjectRef
            # Then: supabase db push
            
            $failCount++
            break
        } catch {
            Write-Host "   ❌ Error: $_" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ""
    $migrationIndex++
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Note: Supabase CLI remote migrations require project linking." -ForegroundColor Yellow
Write-Host ""
Write-Host "Recommended approach:" -ForegroundColor Cyan
Write-Host "  1. Use psql: .\scripts\apply-migrations-cli.ps1" -ForegroundColor White
Write-Host "  2. Or apply manually via Supabase Dashboard" -ForegroundColor White
Write-Host ""

