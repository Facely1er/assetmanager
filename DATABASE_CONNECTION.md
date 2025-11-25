# CyberSoluce Database Connection Information

## 🔐 Production Database Credentials

### Supabase Project
- **Project Reference**: `uvdrwbmhmtgacwzujfzc`
- **Project URL**: `https://uvdrwbmhmtgacwzujfzc.supabase.co`
- **Dashboard**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc

### PostgreSQL Connection String
```
postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres
```

### Connection Details
- **Host**: `db.uvdrwbmhmtgacwzujfzc.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `K1551d0ug0u`

---

## 🔧 Using the Connection String

### Via psql (PostgreSQL Client)

```bash
# Connect to database
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres"

# Run a migration file
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase/migrations/20250125000000_dependency_manager_features.sql
```

### Via Supabase CLI

```bash
# Link to project
supabase link --project-ref uvdrwbmhmtgacwzujfzc

# When prompted, use:
# Database password: K1551d0ug0u
# API URL: https://uvdrwbmhmtgacwzujfzc.supabase.co

# Push migrations
supabase db push
```

### Via Database GUI Tools

**pgAdmin / DBeaver / TablePlus:**
- **Host**: `db.uvdrwbmhmtgacwzujfzc.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `K1551d0ug0u`

---

## 📋 Migration Files

Apply migrations in this order:

1. **Reports Table**
   - File: `supabase/migrations/20250801112702_cold_firefly.sql`
   - Creates: `reports` table with RLS policies

2. **Organizations**
   - File: `supabase/migrations/20250801114506_odd_flower.sql`
   - Creates: `organizations`, `organization_members`, `invitations` tables

3. **Feature Tables**
   - File: `supabase/migrations/20250125000000_dependency_manager_features.sql`
   - Creates: `mitigation_actions`, `business_functions`, `business_impacts`, 
     `continuity_plans`, `nist_controls`, `nist_mappings`, `nist_assessments`, 
     `framework_phases`, `risks` tables

---

## 🔒 Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit passwords to Git** - This file should be in `.gitignore`
2. **Use environment variables** for production deployments
3. **Rotate passwords regularly** via Supabase Dashboard
4. **Use service role key** only for server-side operations
5. **Use anon key** for client-side operations (already configured)

---

## 🚀 Quick Migration Commands

### Apply All Migrations (psql)

```bash
# Windows PowerShell
$connString = "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres"
psql $connString -f supabase/migrations/20250801112702_cold_firefly.sql
psql $connString -f supabase/migrations/20250801114506_odd_flower.sql
psql $connString -f supabase/migrations/20250125000000_dependency_manager_features.sql
```

### Verify Tables Created

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'reports',
  'organizations',
  'organization_members',
  'invitations',
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

---

## 📚 Related Documentation

- **Migration Instructions**: `MIGRATION_INSTRUCTIONS.md`
- **Quick Deploy Guide**: `QUICK_DEPLOY.md`
- **Production Setup**: `PRODUCTION_DEPLOYMENT_SETUP.md`

---

**Last Updated**: January 2025
**Project**: CyberSoluce AssetManager

