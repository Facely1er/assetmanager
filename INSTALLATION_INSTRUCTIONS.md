# 📦 PostgreSQL Client Installation Instructions

## Current Status
Chocolatey installation requires administrator privileges.

## Quick Options

### ✅ Option 1: Run PowerShell as Administrator
1. Close current PowerShell
2. Right-click PowerShell → "Run as Administrator"
3. Run:
   ```powershell
   cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
   choco install postgresql --params '/Password:postgres' -y
   ```
4. Restart PowerShell, then run migrations

### ✅ Option 2: Manual Installation
1. Download: https://www.postgresql.org/download/windows/
2. Install with "Command Line Tools" checked
3. Check "Add to PATH"
4. Restart PowerShell
5. Run: `.\scripts\apply-migrations-simple.ps1`

### ✅ Option 3: Manual Copy/Paste (No Installation)
Use migration files from `migrations-ready/` folder and paste to Supabase SQL Editor.

---

**After installation, verify with:**
```powershell
psql --version
```

**Then apply migrations:**
```powershell
.\scripts\apply-migrations-simple.ps1
```

