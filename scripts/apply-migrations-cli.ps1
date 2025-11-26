# CyberSoluce-AssetManager - Apply Migrations via CLI
# This script applies database migrations using psql (PostgreSQL CLI)

param(
    [string]$DatabaseUrl = "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres",
    [switch]$DryRun = $false
)

Write-Host "🗄️  Applying Database Migrations via CLI" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
Write-Host "🔍 Checking for psql (PostgreSQL CLI)..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ psql found: $psqlVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ psql not found" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install PostgreSQL client tools:" -ForegroundColor Yellow
        Write-Host "  Option 1: Install PostgreSQL (includes psql)" -ForegroundColor White
        Write-Host "    Download: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Option 2: Use Supabase CLI instead" -ForegroundColor White
        Write-Host "    Run: .\scripts\apply-migrations-supabase-cli.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Option 3: Apply migrations manually via Supabase Dashboard" -ForegroundColor White
        Write-Host "    Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ psql not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client tools or use Supabase Dashboard" -ForegroundColor Yellow
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

Write-Host ""
Write-Host "📁 Project directory: $projectRoot" -ForegroundColor Gray
Write-Host "📁 Migrations directory: $migrationsDir" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $migrationsDir)) {
    Write-Host "❌ Migrations directory not found: $migrationsDir" -ForegroundColor Red
    exit 1
}

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Test database connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow
try {
    $testQuery = "SELECT version();"
    $testResult = psql $DatabaseUrl -c $testQuery 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        Write-Host "Error: $testResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to connect to database" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Applying migrations..." -ForegroundColor Yellow
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
            # Apply migration
            $result = psql $DatabaseUrl -f $migrationFile 2>&1
            $exitCode = $LASTEXITCODE
            
            if ($exitCode -eq 0) {
                Write-Host "   ✅ Migration applied successfully" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "   ❌ Migration failed" -ForegroundColor Red
                Write-Host "   Error output:" -ForegroundColor Red
                Write-Host $result -ForegroundColor Red
                $failCount++
            }
        } catch {
            Write-Host "   ❌ Error applying migration: $_" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ""
    $migrationIndex++
}

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migration Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Successful: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -eq 0 -and -not $DryRun) {
    Write-Host "✅ All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify tables in Supabase Table Editor:" -ForegroundColor White
    Write-Host "      https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/editor" -ForegroundColor Cyan
    Write-Host "   2. Get Supabase anon key for deployment" -ForegroundColor White
    Write-Host "   3. Deploy to Netlify" -ForegroundColor White
} elseif ($DryRun) {
    Write-Host "🔍 Dry run completed. Run without -DryRun to apply migrations." -ForegroundColor Yellow
} else {
    Write-Host "Some migrations failed. Please check the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Tip: You can also apply migrations manually via Supabase Dashboard:" -ForegroundColor Yellow
    $dashboardUrl = "https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new"
    Write-Host "   $dashboardUrl" -ForegroundColor Cyan
}

Write-Host ""

