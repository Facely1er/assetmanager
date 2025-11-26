# CyberSoluce AssetManager - Production Deployment Script
# PowerShell script for Windows to deploy to production

# Ensure script runs from project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Verify we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Expected directory: $scriptPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 CyberSoluce AssetManager - Production Deployment" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found. Creating template..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create .env.local with the following variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "VITE_SUPABASE_URL=https://uvdrwbmhmtgacwzujfzc.supabase.co" -ForegroundColor White
    Write-Host "VITE_SUPABASE_ANON_KEY=your_anon_key_here" -ForegroundColor White
    Write-Host "VITE_APP_ENV=production" -ForegroundColor White
    Write-Host "VITE_DEBUG_MODE=false" -ForegroundColor White
    Write-Host "VITE_ENABLE_ERROR_REPORTING=true" -ForegroundColor White
    Write-Host ""
    Write-Host "Get your anon key from: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api" -ForegroundColor Yellow
    Write-Host ""
}

# Check Node.js
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "📦 Checking npm installation..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Production Deployment Steps:" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Type check
Write-Host "Step 2: Running TypeScript type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  TypeScript errors found. Please fix before deploying." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
} else {
    Write-Host "✅ Type check passed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Build
Write-Host "Step 3: Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Verify build output
Write-Host "Step 4: Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ Build output found in dist/ ($([math]::Round($distSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Build output not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Display deployment options
Write-Host "📋 Next Steps for Deployment:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Deploy to Netlify" -ForegroundColor Yellow
Write-Host "  1. Go to https://netlify.com" -ForegroundColor White
Write-Host "  2. Click 'New site from Git'" -ForegroundColor White
Write-Host "  3. Connect your repository" -ForegroundColor White
Write-Host "  4. Set environment variables:" -ForegroundColor White
Write-Host "     - VITE_SUPABASE_URL=https://uvdrwbmhmtgacwzujfzc.supabase.co" -ForegroundColor Gray
Write-Host "     - VITE_SUPABASE_ANON_KEY=your_anon_key" -ForegroundColor Gray
Write-Host "     - VITE_APP_ENV=production" -ForegroundColor Gray
Write-Host "  5. Deploy" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Deploy to Vercel" -ForegroundColor Yellow
Write-Host "  1. Go to https://vercel.com" -ForegroundColor White
Write-Host "  2. Click 'New Project'" -ForegroundColor White
Write-Host "  3. Import your repository" -ForegroundColor White
Write-Host "  4. Set environment variables (same as above)" -ForegroundColor White
Write-Host "  5. Deploy" -ForegroundColor White
Write-Host ""

Write-Host "Option 3: Preview locally" -ForegroundColor Yellow
Write-Host "  Run: npm run preview" -ForegroundColor White
Write-Host ""

Write-Host "📝 Important Reminders:" -ForegroundColor Cyan
Write-Host "  • Apply database migrations before deploying:" -ForegroundColor White
Write-Host "    https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new" -ForegroundColor Gray
Write-Host "  • Get your anon key from:" -ForegroundColor White
Write-Host "    https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api" -ForegroundColor Gray
Write-Host "  • Configure redirect URLs in Supabase:" -ForegroundColor White
Write-Host "    https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Build complete! Ready for deployment." -ForegroundColor Green
Write-Host ""

