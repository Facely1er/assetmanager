# CyberSoluce-AssetManager - Migration Preparation Script
# This script prepares migration files for easy copy-paste to Supabase SQL Editor

param(
    [string]$OutputDir = "migrations-ready"
)

Write-Host "📋 Preparing Migration Files for Supabase" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Get project root (parent of scripts directory)
$scriptPath = $MyInvocation.MyCommand.Path
if (-not $scriptPath) {
    $scriptPath = $PSCommandPath
}
if ($scriptPath) {
    $projectRoot = Split-Path -Parent (Split-Path -Parent $scriptPath)
} else {
    # Fallback: assume we're in the project root
    $projectRoot = Get-Location
}
$migrationsDir = Join-Path $projectRoot "supabase\migrations"
$outputPath = Join-Path $projectRoot $OutputDir

# Create output directory
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
    Write-Host "✅ Created output directory: $outputPath" -ForegroundColor Green
}

# Migration files in order
$migrations = @(
    @{
        File = "20250801112702_cold_firefly.sql"
        Name = "Migration 1: Reports"
        Description = "Creates reports table and related functionality"
    },
    @{
        File = "20250801114506_odd_flower.sql"
        Name = "Migration 2: Organizations"
        Description = "Creates organizations table and related functionality"
    },
    @{
        File = "20250125000000_dependency_manager_features.sql"
        Name = "Migration 3: All Features"
        Description = "Creates all feature tables including assets, risks, mitigations, dependencies, etc."
    }
)

Write-Host "📁 Reading migration files..." -ForegroundColor Yellow
Write-Host ""

$migrationIndex = 1
foreach ($migration in $migrations) {
    $sourceFile = Join-Path $migrationsDir $migration.File
    
    if (Test-Path $sourceFile) {
        $content = Get-Content $sourceFile -Raw
        $outputFile = Join-Path $outputPath "$migrationIndex-$($migration.File)"
        
        # Create formatted output with instructions
        $formattedContent = @"
-- ============================================
-- $($migration.Name)
-- ============================================
-- Description: $($migration.Description)
-- Source File: $($migration.File)
-- 
-- Instructions:
-- 1. Copy ALL content below (from this line to the end)
-- 2. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new
-- 3. Paste into SQL Editor
-- 4. Click "Run" button
-- 5. Verify success message
-- ============================================

$content
"@
        
        Set-Content -Path $outputFile -Value $formattedContent
        Write-Host "✅ Prepared: $($migration.Name)" -ForegroundColor Green
        Write-Host "   Output: $outputFile" -ForegroundColor Gray
        
        $migrationIndex++
    } else {
        Write-Host "❌ File not found: $sourceFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Migration files prepared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open the prepared files in: $outputPath" -ForegroundColor White
Write-Host "   2. Copy each file content one at a time" -ForegroundColor White
Write-Host "   3. Go to Supabase SQL Editor:" -ForegroundColor White
Write-Host "      https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new" -ForegroundColor Cyan
Write-Host "   4. Paste and run each migration in order (1, 2, 3)" -ForegroundColor White
Write-Host "   5. Verify tables in Table Editor" -ForegroundColor White
Write-Host ""

# Create a combined file for reference
$combinedFile = Join-Path $outputPath "ALL_MIGRATIONS_COMBINED.sql"
$combinedContent = "-- ============================================`n"
$combinedContent += "-- ALL MIGRATIONS - RUN IN ORDER`n"
$combinedContent += "-- ============================================`n"
$combinedContent += "-- WARNING: Do NOT run this file directly!`n"
$combinedContent += "-- Run each migration separately in Supabase SQL Editor`n"
$combinedContent += "-- ============================================`n`n"

foreach ($migration in $migrations) {
    $sourceFile = Join-Path $migrationsDir $migration.File
    if (Test-Path $sourceFile) {
        $combinedContent += "-- ============================================`n"
        $combinedContent += "-- $($migration.Name)`n"
        $combinedContent += "-- ============================================`n`n"
        $combinedContent += Get-Content $sourceFile -Raw
        $combinedContent += "`n`n"
    }
}

Set-Content -Path $combinedFile -Value $combinedContent
Write-Host "Combined reference file created: $combinedFile" -ForegroundColor Cyan
Write-Host "   Use this for reference only - run migrations separately" -ForegroundColor Gray
Write-Host ""

