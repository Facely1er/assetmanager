# 🚀 Netlify Deployment Guide - CyberSoluce AssetManager

## ✅ Pre-Deployment Checklist

- [x] Build verified locally (`npm run build` successful)
- [x] `netlify.toml` configured with security headers and redirects
- [ ] Supabase credentials ready
- [ ] Database migrations applied
- [ ] Netlify account created

---

## Method 1: Deploy via Netlify Dashboard (Recommended for First Time)

### Step 1: Connect Repository

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select the `CyberSoluce-AssetManager` repository
5. Click **"Import"**

### Step 2: Configure Build Settings

Netlify will auto-detect settings from `netlify.toml`, but verify:

- **Build command**: `npm ci --production=false && npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (set in `netlify.toml`)

### Step 3: Set Environment Variables

Before deploying, add these environment variables in **Site settings** → **Environment variables**:

```
VITE_SUPABASE_URL=https://uvdrwbmhmtgacwzujfzc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ERROR_REPORTING=true
```

**To get your Supabase anon key:**
1. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api
2. Copy the `anon` `public` key
3. Paste it as `VITE_SUPABASE_ANON_KEY`

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (~2-3 minutes)
3. Your site will be live at: `https://your-site-name.netlify.app`

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```powershell
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```powershell
netlify login
```

This will open your browser to authenticate.

### Step 3: Initialize Site (First Time Only)

```powershell
cd C:\Users\facel\Downloads\GitHub\CyberSoluce-AssetManager
netlify init
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Select your team
- **Site name**: (optional, or use auto-generated)
- **Build command**: `npm ci --production=false && npm run build` (already in netlify.toml)
- **Directory to deploy**: `dist` (already in netlify.toml)

### Step 4: Set Environment Variables

```powershell
# Set production environment variables
netlify env:set VITE_SUPABASE_URL "https://uvdrwbmhmtgacwzujfzc.supabase.co" --context production
netlify env:set VITE_SUPABASE_ANON_KEY "your_anon_key_here" --context production
netlify env:set VITE_APP_ENV "production" --context production
netlify env:set VITE_DEBUG_MODE "false" --context production
netlify env:set VITE_ENABLE_ERROR_REPORTING "true" --context production
```

### Step 5: Deploy

```powershell
# Deploy to production
netlify deploy --prod
```

Or deploy a preview first:

```powershell
# Deploy preview (for testing)
netlify deploy
```

---

## Post-Deployment Configuration

### 1. Configure Supabase Redirect URLs

1. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration
2. Add your Netlify URL:
   - **Site URL**: `https://your-site-name.netlify.app`
   - **Redirect URLs**:
     - `https://your-site-name.netlify.app/**`
     - `https://your-site-name.netlify.app/auth/callback`

### 2. Verify Deployment

1. Visit your site: `https://your-site-name.netlify.app`
2. Test authentication (sign up/login)
3. Test creating an asset
4. Verify data persists in Supabase dashboard

### 3. Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `assetmanager.cybersoluce.com`)
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://uvdrwbmhmtgacwzujfzc.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your anon key from Supabase | ✅ Yes |
| `VITE_APP_ENV` | `production` | ✅ Yes |
| `VITE_DEBUG_MODE` | `false` | ⚠️ Recommended |
| `VITE_ENABLE_ERROR_REPORTING` | `true` | ⚠️ Recommended |

---

## Troubleshooting

### Build Fails

**Issue**: Build fails with environment variable errors
- **Solution**: Ensure all `VITE_*` variables are set in Netlify dashboard

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run type-check` locally to identify issues

**Issue**: Build fails with "Cannot find module"
- **Solution**: Ensure `npm ci --production=false` runs (installs dev dependencies)

### Database Connection Issues

**Issue**: "Supabase not configured" error
- **Solution**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

**Issue**: Authentication not working
- **Solution**: Check redirect URLs in Supabase dashboard match your Netlify domain

### Deployment Issues

**Issue**: 404 errors on routes
- **Solution**: Verify SPA redirect rules are configured (already in `netlify.toml`)

**Issue**: Assets not loading
- **Solution**: Check build output directory matches `dist` in Netlify settings

**Issue**: Security headers not applied
- **Solution**: Verify `netlify.toml` is in repository root

---

## Quick Deploy Commands

```powershell
# Quick deploy (if already initialized)
netlify deploy --prod

# Deploy with build
netlify build
netlify deploy --prod

# View deployment status
netlify status

# Open site in browser
netlify open:site

# View deployment logs
netlify logs
```

---

## Useful Links

- **Netlify Dashboard**: https://app.netlify.com
- **Supabase Dashboard**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc
- **Supabase API Settings**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api
- **Supabase Auth Settings**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/auth/url-configuration
- **Netlify Docs**: https://docs.netlify.com

---

## Next Steps After Deployment

1. ✅ Test all features (authentication, CRUD operations)
2. ✅ Set up monitoring (Netlify Analytics or external service)
3. ✅ Configure automated backups in Supabase
4. ✅ Set up uptime monitoring
5. ✅ Review security settings
6. ✅ Create user documentation

---

**Status**: Ready for deployment! 🎉

**Last Updated**: January 2025

