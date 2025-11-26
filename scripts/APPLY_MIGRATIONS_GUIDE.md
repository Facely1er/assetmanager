# 🗄️ Apply Migrations via CLI - Complete Guide

## Option 1: Using psql (PostgreSQL CLI) - Recommended

### Step 1: Install PostgreSQL Client Tools

**Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. During installation, make sure to install "Command Line Tools"
3. Or download just the client tools: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

**Alternative - Standalone psql:**
- Download from: https://www.postgresql.org/ftp/binary/
- Extract and add to PATH

### Step 2: Verify Installation
```powershell
psql --version
```

### Step 3: Apply Migrations

**Using the script:**
```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
.\scripts\apply-migrations-cli.ps1
```

**Or manually:**
```powershell
$dbUrl = "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres"

# Apply migrations one by one
psql $dbUrl -f supabase\migrations\20250801112702_cold_firefly.sql
psql $dbUrl -f supabase\migrations\20250801114506_odd_flower.sql
psql $dbUrl -f supabase\migrations\20250125000000_dependency_manager_features.sql
```

---

## Option 2: Using Supabase CLI

### Step 1: Install Supabase CLI
```powershell
npm install -g supabase
```

### Step 2: Login
```powershell
supabase login
```

### Step 3: Link Project
```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
supabase link --project-ref uvdrwbmhmtgacwzujfzc
```

### Step 4: Apply Migrations
```powershell
supabase db push
```

**Note:** This requires the project to be properly linked and configured.

---

## Option 3: Using Supabase REST API (Advanced)

You can use PowerShell to call the Supabase Management API:

```powershell
# This requires your Supabase access token
# Get it from: https://app.supabase.com/account/tokens

$supabaseUrl = "https://api.supabase.com/v1/projects/uvdrwbmhmtgacwzujfzc"
$accessToken = "your-access-token-here"

# Read migration file
$migrationContent = Get-Content "supabase\migrations\20250801112702_cold_firefly.sql" -Raw

# Execute via API (requires proper authentication)
# Note: This is more complex and requires API setup
```

---

## Option 4: Manual Application (Easiest)

If CLI tools are not available, use the prepared migration files:

1. **Open migration files** from `migrations-ready/` folder
2. **Copy content** from each file
3. **Go to Supabase SQL Editor**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new
4. **Paste and run** each migration in order

---

## Quick Command Reference

### Test Database Connection
```powershell
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -c "SELECT version();"
```

### Apply Single Migration
```powershell
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase\migrations\20250801112702_cold_firefly.sql
```

### Apply All Migrations (PowerShell)
```powershell
$dbUrl = "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres"
$migrations = @(
    "supabase\migrations\20250801112702_cold_firefly.sql",
    "supabase\migrations\20250801114506_odd_flower.sql",
    "supabase\migrations\20250125000000_dependency_manager_features.sql"
)

foreach ($mig in $migrations) {
    Write-Host "Applying: $mig"
    psql $dbUrl -f $mig
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Success" -ForegroundColor Green
    } else {
        Write-Host "[FAILED]" -ForegroundColor Red
        break
    }
}
```

---

## Troubleshooting

### psql not found
- Install PostgreSQL client tools
- Add PostgreSQL bin directory to PATH
- Restart PowerShell after installation

### Connection refused
- Check database URL is correct
- Verify Supabase project is active
- Check firewall settings

### Authentication failed
- Verify password in connection string
- Check Supabase project credentials

### Migration errors
- Check if tables already exist (use `IF NOT EXISTS` in migrations)
- Verify migration order (1, 2, 3)
- Check Supabase logs for detailed errors

---

## Recommended Approach

**For Windows users without psql:**
1. **Easiest**: Use manual method (Option 4) - copy/paste to Supabase Dashboard
2. **Best for automation**: Install psql and use Option 1
3. **For developers**: Use Supabase CLI (Option 2)

---

**Database Connection String:**
```
postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres
```

**Supabase SQL Editor:**
https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

