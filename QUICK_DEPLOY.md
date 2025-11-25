# 🚀 CyberSoluce Quick Deployment Guide

## Prerequisites

- CyberSoluce Supabase project: `uvdrwbmhmtgacwzujfzc`
- Node.js 18+ installed
- Git repository connected

---

## 1️⃣ Apply Database Migrations (5 minutes)

### Option A: Via Supabase Dashboard (Easiest)

1. **Open SQL Editor**
   - Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

2. **Apply Migrations** (in order):
   ```sql
   -- Migration 1: Reports
   -- Copy contents from: supabase/migrations/20250801112702_cold_firefly.sql
   
   -- Migration 2: Organizations  
   -- Copy contents from: supabase/migrations/20250801114506_odd_flower.sql
   
   -- Migration 3: All Features
   -- Copy contents from: supabase/migrations/20250125000000_dependency_manager_features.sql
   ```

3. **Verify**
   - Go to Table Editor
   - Check that all tables are created

### Option B: Via psql (PostgreSQL Client)

```bash
# Run migrations using psql
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase/migrations/20250801112702_cold_firefly.sql
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase/migrations/20250801114506_odd_flower.sql
psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase/migrations/20250125000000_dependency_manager_features.sql
```

**Database Connection String:**
```
postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres
```

---

## 2️⃣ Get Supabase Credentials (2 minutes)

1. **Get Anon Key**
   - Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api
   - Copy the `anon` `public` key

2. **Note Your Project URL**
   - Already configured: `https://uvdrwbmhmtgacwzujfzc.supabase.co`

---

## 3️⃣ Deploy to Netlify (10 minutes)

### Option A: Via Dashboard

1. **Connect Repository**
   - Go to https://netlify.com
   - Click **"New site from Git"**
   - Connect `CyberSoluce-AssetManager` repository

2. **Configure Build**
   - Build command: `npm ci --production=false && npm run build` (auto-detected)
   - Publish directory: `dist` (auto-detected)

3. **Set Environment Variables**
   ```
   VITE_SUPABASE_URL = https://uvdrwbmhmtgacwzujfzc.supabase.co
   VITE_SUPABASE_ANON_KEY = [paste your anon key]
   VITE_APP_ENV = production
   VITE_DEBUG_MODE = false
   VITE_ENABLE_ERROR_REPORTING = true
   ```

4. **Deploy**
   - Click **"Deploy site"**
   - Wait for build to complete (~2-3 minutes)

### Option B: Via CLI

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (first time only)
netlify init

# Deploy
netlify deploy --prod
```

---

## 4️⃣ Configure Authentication (5 minutes)

1. **Set Redirect URLs**
   - Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration
   - Add Site URL: `https://your-site-name.netlify.app`
   - Add Redirect URLs:
     - `https://your-site-name.netlify.app/**`
     - `https://your-site-name.netlify.app/auth/callback`

2. **Configure Email** (Optional)
   - Go to: Authentication → Settings
   - Configure email provider
   - Test email delivery

---

## 5️⃣ Test Deployment (5 minutes)

1. **Visit Your Site**
   - Go to: `https://your-site-name.netlify.app`

2. **Test Authentication**
   - Create a test account
   - Verify signup/login works

3. **Test Features**
   - Create an asset
   - Verify data persists
   - Check Supabase dashboard for data

---

## ✅ Deployment Complete!

Your CyberSoluce AssetManager is now live in production!

### Quick Links

- **Supabase Dashboard**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc
- **SQL Editor**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new
- **API Settings**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api
- **Auth Settings**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Node.js version is 18+
- Check build logs in Netlify dashboard

### Database Connection Issues
- Verify `VITE_SUPABASE_URL` matches: `https://uvdrwbmhmtgacwzujfzc.supabase.co`
- Check `VITE_SUPABASE_ANON_KEY` is correct
- Verify migrations were applied

### Authentication Not Working
- Check redirect URLs in Supabase dashboard
- Verify Site URL matches your Netlify domain
- Check email configuration if using email auth

---

**Total Time**: ~30 minutes
**Status**: Ready for production! 🎉

