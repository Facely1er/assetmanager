# 🔧 Administrator Installation Steps

## Step-by-Step Instructions

### Step 1: Open PowerShell as Administrator

1. **Press Windows Key + X**
2. **Select "Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
3. **Click "Yes"** when prompted by User Account Control

### Step 2: Navigate to Project Directory

```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
```

### Step 3: Install PostgreSQL via Chocolatey

```powershell
choco install postgresql --params '/Password:postgres' -y
```

**This will:**
- Download PostgreSQL (~200MB)
- Install PostgreSQL server and client tools
- Add psql to your PATH
- Take 5-10 minutes depending on your internet speed

### Step 4: Verify Installation

After installation completes, verify psql is available:

```powershell
psql --version
```

**Expected output:** `psql (PostgreSQL) 16.x` or similar

### Step 5: Close and Restart PowerShell

**Important:** Close the admin PowerShell window and open a new regular PowerShell window (not admin) to refresh the PATH environment variable.

### Step 6: Navigate Back to Project

```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
```

### Step 7: Run Migration Script

```powershell
.\scripts\apply-migrations-simple.ps1
```

This will apply all 3 migrations to your Supabase database.

---

## Troubleshooting

### If psql not found after installation:
1. **Restart your computer** (ensures PATH is fully refreshed)
2. **Or manually add to PATH:**
   - Usually: `C:\Program Files\PostgreSQL\16\bin`
   - Add to System Environment Variables → Path

### If installation fails:
- Try manual installation: https://www.postgresql.org/download/windows/
- Or use manual copy/paste method (no installation needed)

---

## Quick Copy-Paste Commands

Copy these commands one by one into Admin PowerShell:

```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
```

```powershell
choco install postgresql --params '/Password:postgres' -y
```

```powershell
psql --version
```

After restarting PowerShell (regular, not admin):

```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
.\scripts\apply-migrations-simple.ps1
```

---

**Ready to proceed?** Follow the steps above, then come back here once installation is complete!

