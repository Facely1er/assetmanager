# CyberSoluce-AssetManager - Repository Migration Script
# Migrates from assetmanager repo to new cybersoluce-assetmanager repo

param(
    [string]$NewRepoUrl = "https://github.com/Facely1er/cybersoluce-assetmanager.git",
    [switch]$DryRun
)

Write-Host "🔄 CyberSoluce-AssetManager - Repository Migration" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Get project root
$currentDir = (Get-Location).Path
if ($currentDir -like "*\scripts") {
    $projectRoot = Split-Path -Parent $currentDir
} else {
    $projectRoot = $currentDir
}

Set-Location $projectRoot

# Check if git repository exists
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository!" -ForegroundColor Red
    Write-Host "   Initialize git first: git init" -ForegroundColor Yellow
    exit 1
}

# Check current remote
Write-Host "📋 Checking current git configuration..." -ForegroundColor Yellow
Write-Host ""

try {
    $currentRemote = git remote get-url origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Current remote: $currentRemote" -ForegroundColor Gray
    } else {
        Write-Host "No remote configured" -ForegroundColor Yellow
    }
} catch {
    Write-Host "No remote configured" -ForegroundColor Yellow
}

# Check current branch
$currentBranch = git branch --show-current 2>&1
Write-Host "Current branch: $currentBranch" -ForegroundColor Gray
Write-Host ""

# Check for uncommitted changes
Write-Host "🔍 Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain 2>&1
if ($status) {
    Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please commit or stash changes before migrating:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor Cyan
    Write-Host "  git commit -m 'Your commit message'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or stash them:" -ForegroundColor Yellow
    Write-Host "  git stash" -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Migration cancelled." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""

# Dry run check
if ($DryRun.IsPresent) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would execute:" -ForegroundColor Cyan
    Write-Host "  1. Remove old remote: git remote remove origin" -ForegroundColor White
    Write-Host "  2. Add new remote: git remote add origin $NewRepoUrl" -ForegroundColor White
    Write-Host "  3. Push to new repo: git push -u origin $currentBranch" -ForegroundColor White
    Write-Host ""
    Write-Host "Run without -DryRun to execute migration" -ForegroundColor Yellow
    exit 0
}

# Confirm migration
Write-Host "⚠️  This will:" -ForegroundColor Yellow
Write-Host "  1. Remove current remote: origin" -ForegroundColor White
Write-Host "  2. Add new remote: $NewRepoUrl" -ForegroundColor White
Write-Host "  3. Push code to new repository" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Create the new repository on GitHub first!" -ForegroundColor Red
Write-Host "   Go to: https://github.com/new" -ForegroundColor Cyan
Write-Host "   Repository name: cybersoluce-assetmanager" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "Have you created the new repository? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host ""
    Write-Host "Please create the repository first:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/new" -ForegroundColor Cyan
    Write-Host "  2. Name: cybersoluce-assetmanager" -ForegroundColor Cyan
    Write-Host "  3. Don't initialize with README" -ForegroundColor Cyan
    Write-Host "  4. Run this script again" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "🔄 Starting migration..." -ForegroundColor Yellow
Write-Host ""

# Step 1: Remove old remote
Write-Host "[1/3] Removing old remote..." -ForegroundColor Cyan
try {
    git remote remove origin 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Old remote removed" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No remote to remove (may already be removed)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not remove remote: $_" -ForegroundColor Yellow
}

# Step 2: Add new remote
Write-Host ""
Write-Host "[2/3] Adding new remote..." -ForegroundColor Cyan
try {
    git remote add origin $NewRepoUrl 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ New remote added: $NewRepoUrl" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to add remote" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error adding remote: $_" -ForegroundColor Red
    exit 1
}

# Verify remote
Write-Host ""
Write-Host "[3/3] Verifying remote..." -ForegroundColor Cyan
$verifyRemote = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Remote verified: $verifyRemote" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to verify remote" -ForegroundColor Red
    exit 1
}

# Step 3: Push to new repository
Write-Host ""
Write-Host "📤 Pushing to new repository..." -ForegroundColor Yellow
Write-Host "   Branch: $currentBranch" -ForegroundColor Gray
Write-Host "   Remote: $NewRepoUrl" -ForegroundColor Gray
Write-Host ""

$pushResult = git push -u origin $currentBranch 2>&1
$pushExitCode = $LASTEXITCODE

if ($pushExitCode -eq 0) {
    Write-Host "✅ Successfully pushed to new repository!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Repository doesn't exist (create it first)" -ForegroundColor White
    Write-Host "  - Authentication required (check git credentials)" -ForegroundColor White
    Write-Host "  - Network issues" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify repository:" -ForegroundColor Yellow
Write-Host "   https://github.com/Facely1er/cybersoluce-assetmanager" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Update Netlify connection:" -ForegroundColor Yellow
Write-Host "   - Go to Netlify Dashboard" -ForegroundColor White
Write-Host "   - Site settings → Build & deploy" -ForegroundColor White
Write-Host "   - Link to new repository: cybersoluce-assetmanager" -ForegroundColor White
Write-Host ""
Write-Host "3. Test deployment:" -ForegroundColor Yellow
Write-Host "   - Push a commit or trigger manual deploy" -ForegroundColor White
Write-Host "   - Verify build succeeds" -ForegroundColor White
Write-Host ""
Write-Host "Repository URL: $NewRepoUrl" -ForegroundColor Gray
Write-Host ""

