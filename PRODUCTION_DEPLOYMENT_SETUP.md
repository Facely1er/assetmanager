# CyberSoluce Production Deployment Setup

## 🚀 Quick Start - Production Deployment

This guide will help you deploy CyberSoluce AssetManager to production using the existing CyberSoluce Supabase project.

---

## Step 1: Supabase Configuration

### Get Your Supabase Credentials

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc
   - Or navigate to: https://app.supabase.com and select project `uvdrwbmhmtgacwzujfzc`

2. **Get API Credentials**
   - Go to: **Settings** → **API**
   - Copy the following values:
     - **Project URL**: `https://uvdrwbmhmtgacwzujfzc.supabase.co`
     - **anon/public key**: Copy the `anon` `public` key

3. **Apply Database Migrations**
   - Go to: **SQL Editor** → **New query**
   - Apply migrations in this order:
     1. `supabase/migrations/20250801112702_cold_firefly.sql` (reports table)
     2. `supabase/migrations/20250801114506_odd_flower.sql` (organizations)
     3. `supabase/migrations/20250125000000_dependency_manager_features.sql` (all features)
   - Or use the SQL Editor link: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new

---

## Step 2: Environment Variables

### For Local Development

Create `.env.local` file in the project root:

```bash
# CyberSoluce Supabase Configuration
VITE_SUPABASE_URL=https://uvdrwbmhmtgacwzujfzc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Application Environment
VITE_APP_ENV=production
NODE_ENV=production

# Debug & Monitoring
VITE_DEBUG_MODE=false
VITE_ENABLE_ERROR_REPORTING=true
```

### For Netlify Deployment

1. **Go to Netlify Dashboard**
   - Navigate to your site settings
   - Go to: **Site settings** → **Environment variables**

2. **Add Environment Variables**
   ```
   VITE_SUPABASE_URL = https://uvdrwbmhmtgacwzujfzc.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key_here
   VITE_APP_ENV = production
   VITE_DEBUG_MODE = false
   VITE_ENABLE_ERROR_REPORTING = true
   ```

### For Vercel Deployment

1. **Using Vercel CLI**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   # Enter: https://uvdrwbmhmtgacwzujfzc.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY production
   # Enter: your_anon_key_here
   
   vercel env add VITE_APP_ENV production
   # Enter: production
   ```

2. **Using Vercel Dashboard**
   - Go to: **Project Settings** → **Environment Variables**
   - Add each variable for **Production** environment

---

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard

1. **Connect Repository**
   - Go to https://netlify.com
   - Click **"New site from Git"**
   - Connect your GitHub/GitLab repository
   - Select the `CyberSoluce-AssetManager` repository

2. **Build Settings** (Auto-detected from `netlify.toml`)
   - Build command: `npm ci --production=false && npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Set Environment Variables**
   - Add all variables from Step 2 above

4. **Deploy**
   - Click **"Deploy site"**
   - Netlify will build and deploy automatically

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to https://vercel.com
   - Click **"New Project"**
   - Import your repository
   - Select the `CyberSoluce-AssetManager` repository

2. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   - Add all variables from Step 2 above

4. **Deploy**
   - Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## Step 5: Configure Custom Domain

### Netlify

1. **Add Domain**
   - Go to: **Site settings** → **Domain management**
   - Click **"Add custom domain"**
   - Enter your domain (e.g., `assetmanager.cybersoluce.com`)

2. **Configure DNS**
   - Add CNAME record: `www` → `your-site-name.netlify.app`
   - Or A record: `@` → Netlify IP (provided in dashboard)

3. **SSL Certificate**
   - Netlify automatically provisions SSL certificates
   - Wait for certificate activation (usually 1-2 minutes)

### Vercel

1. **Add Domain**
   - Go to: **Project Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your domain

2. **Configure DNS**
   - Follow Vercel's DNS configuration instructions
   - Add the provided DNS records to your domain registrar

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates

---

## Step 6: Verify Deployment

### 1. Test Application Access
- Visit your production URL
- Verify the application loads correctly

### 2. Test Authentication
- Create a test user account
- Verify signup/login works
- Check email confirmation (if enabled)

### 3. Test Database Connection
- Create an asset
- Verify data persists
- Check that data appears in Supabase dashboard

### 4. Verify Features
- Test asset management
- Test risk management
- Test mitigation actions
- Test NIST framework features

---

## Step 7: Configure Supabase Authentication

### Email Configuration

1. **Go to Supabase Dashboard**
   - Navigate to: **Authentication** → **Settings**

2. **Configure Email Provider**
   - Choose email provider (SMTP or Supabase default)
   - Configure SMTP settings if using custom provider
   - Test email delivery

3. **Configure Redirect URLs**
   - Add production URL: `https://your-domain.com`
   - Add production callback: `https://your-domain.com/auth/callback`
   - Add any staging URLs if applicable

### Email Templates

1. **Customize Email Templates**
   - Go to: **Authentication** → **Email Templates**
   - Customize:
     - Confirm signup
     - Reset password
     - Magic link
     - Change email

---

## Production Checklist

### ✅ Pre-Deployment
- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Build tested locally (`npm run build`)

### ✅ Deployment
- [ ] Deployed to hosting platform
- [ ] Environment variables configured in platform
- [ ] Custom domain configured
- [ ] SSL certificate active

### ✅ Post-Deployment
- [ ] Application accessible
- [ ] Authentication working
- [ ] Database connection verified
- [ ] All features tested
- [ ] Email configuration verified

### ✅ Security
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] RLS policies verified
- [ ] Environment variables secured

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with environment variable errors
- **Solution**: Ensure all `VITE_*` variables are set in deployment platform

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run type-check` locally to identify issues

### Database Connection Issues

**Issue**: "Supabase not configured" error
- **Solution**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

**Issue**: Authentication not working
- **Solution**: Check redirect URLs in Supabase dashboard match your domain

### Deployment Issues

**Issue**: 404 errors on routes
- **Solution**: Verify SPA redirect rules are configured (already in `netlify.toml`)

**Issue**: Assets not loading
- **Solution**: Check build output directory matches platform configuration

---

## Support Resources

- **Supabase Dashboard**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc
- **Supabase SQL Editor**: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new
- **Netlify Docs**: https://docs.netlify.com
- **Vercel Docs**: https://vercel.com/docs

---

## Next Steps

After successful deployment:

1. **Set up monitoring** (Sentry, Google Analytics)
2. **Configure automated backups** in Supabase
3. **Set up uptime monitoring**
4. **Review security settings**
5. **Create user documentation**

---

**Last Updated**: January 2025
**Status**: Ready for production deployment

