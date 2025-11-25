# Database Migration Instructions

## Option 1: Using Supabase Dashboard (Recommended - Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc
   - Or navigate to: https://app.supabase.com and select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Open the file: `supabase/migrations/20250125000000_dependency_manager_features.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify**
   - Check that all tables were created
   - You should see 8 new tables in the Table Editor

---

## Option 2: Using Supabase CLI

### Install Supabase CLI

**Windows (using Scoop):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows (using Chocolatey):**
```powershell
choco install supabase
```

**Or download directly:**
- Visit: https://github.com/supabase/cli/releases
- Download the Windows executable
- Add to PATH

### Link Project

```bash
supabase link --project-ref uvdrwbmhmtgacwzujfzc
```

When prompted, enter:
- **Database password**: `[K1551d0ug0u]`
- **API URL**: `https://uvdrwbmhmtgacwzujfzc.supabase.co`
- **DB URL**: `postgresql://postgres:[K1551d0ug0u]@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres`

### Run Migration

```bash
supabase db push
```

Or to run a specific migration:

```bash
supabase migration up
```

---

## Option 3: Using psql (PostgreSQL Client)

### Install PostgreSQL Client

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use: `choco install postgresql` or `scoop install postgresql`

### Run Migration

```bash
psql "postgresql://postgres:[K1551d0ug0u]@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase/migrations/20250125000000_dependency_manager_features.sql
```

**Note:** Replace `[K1551d0ug0u]` with your actual password (remove brackets).

---

## Option 4: Using Node.js Script

I've created a script, but Supabase's JS client doesn't support raw SQL execution directly. The easiest method is **Option 1** (Supabase Dashboard).

---

## Verification

After running the migration, verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'mitigation_actions',
  'business_functions',
  'business_impacts',
  'continuity_plans',
  'nist_controls',
  'nist_mappings',
  'nist_assessments',
  'framework_phases',
  'risks'
)
ORDER BY table_name;
```

You should see all 9 tables listed.

---

## Troubleshooting

### Error: "relation already exists"
- This is OK! The migration uses `CREATE TABLE IF NOT EXISTS`
- The tables may already exist from a previous run

### Error: "permission denied"
- Make sure you're using the service_role key or have proper permissions
- Check RLS policies if you get access errors

### Error: "function does not exist"
- The `update_updated_at_column()` function will be created by the migration
- If it already exists, that's fine

---

## Quick SQL Editor Link

Direct link to your Supabase SQL Editor:
https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

