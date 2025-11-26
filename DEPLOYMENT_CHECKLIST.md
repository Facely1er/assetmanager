# 🚀 CyberSoluce-AssetManager Deployment Checklist

**Date**: January 2025  
**Estimated Time**: ~45 minutes  
**Status**: Ready to Deploy

---

## Pre-Deployment Checklist

### ✅ Prerequisites
- [x] Node.js 18+ installed
- [x] npm installed
- [x] Git repository cloned
- [x] Supabase project exists: `uvdrwbmhmtgacwzujfzc`
- [ ] Netlify account created
- [ ] Supabase anon key obtained

---

## Step 1: Verify Local Build (5 minutes)

### 1.1 Check Node.js Version
```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 1.2 Install Dependencies
```powershell
npm install
```

### 1.3 Test Build Locally
```powershell
npm run build
```

**Expected Result**: 
- Build completes without errors
- `dist/` folder is created
- No TypeScript errors

**If Build Fails**:
- Check Node.js version (must be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules; npm install`
- Check for TypeScript errors: `npm run type-check`

---

## Step 2: Apply Database Migrations (15 minutes)

### 2.1 Access Supabase SQL Editor
- Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

### 2.2 Apply Migrations (in order)

**Migration 1: Reports**
1. Open: `supabase/migrations/20250801112702_cold_firefly.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click "Run"

**Migration 2: Organizations**
1. Open: `supabase/migrations/20250801114506_odd_flower.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click "Run"

**Migration 3: All Features**
1. Open: `supabase/migrations/20250125000000_dependency_manager_features.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click "Run"

### 2.3 Verify Migrations
- Go to: Table Editor
- Verify these tables exist:
  - `assets`
  - `risks`
  - `mitigations`
  - `dependencies`
  - `organizations`
  - `reports`
  - `nist_assessments`
  - `business_impacts`
  - `frameworks`

**✅ Checkpoint**: All tables created successfully

---

## Step 3: Get Supabase Credentials (2 minutes)

### 3.1 Get Anon Key
1. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api
2. Find "Project API keys" section
3. Copy the `anon` `public` key (starts with `eyJ...`)

### 3.2 Note Project URL
- Project URL: `https://uvdrwbmhmtgacwzujfzc.supabase.co`
- (Already configured in code)

**✅ Checkpoint**: Credentials ready for Netlify

---

## Step 4: Deploy to Netlify (10 minutes)

### Option A: Via Netlify Dashboard (Recommended)

#### 4.1 Connect Repository
1. Go to: https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select `CyberSoluce-AssetManager` repository

#### 4.2 Configure Build Settings
Netlify should auto-detect:
- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`

If not auto-detected, set manually:
- Build command: `npm install && npm run build`
- Publish directory: `dist`

#### 4.3 Set Environment Variables
Go to **Site settings** → **Environment variables** → **Add variable**

Add these variables:
```
VITE_SUPABASE_URL = https://uvdrwbmhmtgacwzujfzc.supabase.co
VITE_SUPABASE_ANON_KEY = [paste your anon key from Step 3]
VITE_APP_ENV = production
VITE_DEBUG_MODE = false
VITE_ENABLE_ERROR_REPORTING = true
```

#### 4.4 Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (~2-3 minutes)
3. Note your site URL: `https://your-site-name.netlify.app`

**✅ Checkpoint**: Site deployed successfully

### Option B: Via Netlify CLI

```powershell
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to project
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager

# Initialize Netlify (first time only)
netlify init

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://uvdrwbmhmtgacwzujfzc.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key-here"
netlify env:set VITE_APP_ENV "production"
netlify env:set VITE_DEBUG_MODE "false"
netlify env:set VITE_ENABLE_ERROR_REPORTING "true"

# Deploy to production
netlify deploy --prod
```

---

## Step 5: Configure Supabase Authentication (5 minutes)

### 5.1 Set Site URL
1. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration
2. Set **Site URL** to: `https://your-site-name.netlify.app`

### 5.2 Add Redirect URLs
Add these redirect URLs:
- `https://your-site-name.netlify.app/**`
- `https://your-site-name.netlify.app/auth/callback`
- `https://your-site-name.netlify.app/*`

### 5.3 Configure Email (Optional)
1. Go to: **Authentication** → **Settings**
2. Configure email provider (SMTP)
3. Test email delivery

**✅ Checkpoint**: Authentication configured

---

## Step 6: Test Deployment (5 minutes)

### 6.1 Visit Your Site
- Go to: `https://your-site-name.netlify.app`
- Verify site loads without errors

### 6.2 Test Authentication
1. Click "Sign Up" or "Sign In"
2. Create a test account
3. Verify email confirmation (if enabled)
4. Sign in successfully

### 6.3 Test Core Features
1. **Create an Asset**
   - Navigate to Asset Inventory
   - Click "Add Asset"
   - Fill in required fields
   - Save asset
   - Verify asset appears in list

2. **Verify Database Connection**
   - Go to Supabase Dashboard → Table Editor
   - Check `assets` table
   - Verify your test asset appears

3. **Test Free Tools**
   - Navigate to `/tools/`
   - Verify all 3 tools load:
     - Data Inventory Tool
     - Information Asset Register
     - Vendor Register Manager

**✅ Checkpoint**: All features working

---

## Post-Deployment Tasks

### Immediate (First Day)
- [ ] Monitor error logs in Netlify dashboard
- [ ] Test all major user flows
- [ ] Verify authentication works
- [ ] Check database connections

### First Week
- [ ] Set up error tracking (Sentry recommended)
- [ ] Clean up console.log statements (127 found)
- [ ] Run Lighthouse audit
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring

### First Month
- [ ] Perform security audit
- [ ] Optimize based on usage patterns
- [ ] Set up automated backups
- [ ] Document operational procedures
- [ ] Configure monitoring dashboards

---

## Troubleshooting

### Build Fails
**Symptoms**: Build fails in Netlify
**Solutions**:
1. Check Node.js version (must be 18+)
2. Verify environment variables are set correctly
3. Check build logs in Netlify dashboard
4. Try building locally: `npm run build`

### Database Connection Issues
**Symptoms**: App can't connect to Supabase
**Solutions**:
1. Verify `VITE_SUPABASE_URL` matches: `https://uvdrwbmhmtgacwzujfzc.supabase.co`
2. Check `VITE_SUPABASE_ANON_KEY` is correct
3. Verify migrations were applied
4. Check Supabase project is active

### Authentication Not Working
**Symptoms**: Can't sign up/sign in
**Solutions**:
1. Check redirect URLs in Supabase dashboard
2. Verify Site URL matches your Netlify domain
3. Check email configuration if using email auth
4. Verify RLS policies are enabled

### 404 Errors
**Symptoms**: Routes return 404
**Solutions**:
1. Verify `netlify.toml` redirect rules are correct
2. Check SPA routing is configured
3. Verify `dist/index.html` exists

---

## Quick Reference Links

### Supabase
- **Dashboard**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc
- **SQL Editor**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new
- **API Settings**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api
- **Auth Settings**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration
- **Table Editor**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/editor

### Netlify
- **Dashboard**: https://app.netlify.com
- **Documentation**: https://docs.netlify.com

### Project Files
- **Migration Files**: `supabase/migrations/`
- **Deployment Config**: `netlify.toml`
- **Build Config**: `vite.config.ts`
- **Quick Deploy Guide**: `QUICK_DEPLOY.md`

---

## Success Criteria

✅ **Deployment Successful When**:
1. Site is accessible at Netlify URL
2. Authentication (sign up/sign in) works
3. Can create and view assets
4. Database connection verified
5. Free tools accessible at `/tools/`
6. No console errors in browser
7. Build completes successfully

---

## Next Steps After Deployment

1. **Share the URL** with your team
2. **Set up monitoring** (Sentry, LogRocket, etc.)
3. **Configure custom domain** (optional)
4. **Set up CI/CD** for automatic deployments
5. **Document deployment process** for team

---

**Status**: Ready to deploy! 🚀  
**Estimated Time**: 45 minutes  
**Last Updated**: January 2025

