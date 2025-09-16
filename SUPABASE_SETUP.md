# 🔧 Secure Supabase Setup Guide

## 🔒 **Security-First Approach**

Your Supabase credentials are now loaded **securely** from your hosting platform (Vercel or Netlify) environment variables, not hardcoded in the client-side code.

## Quick Setup (2 minutes)

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Click "Settings" (gear icon)** in the left sidebar
3. **Click "API"**
4. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 2: Set Hosting Environment Variables

#### If you deploy with **Vercel**

1. **Open the Vercel Dashboard** → select your RoomLedger project
2. Go to **Settings** → **Environment Variables**
3. Click **"Add"** twice and create:

   - `SUPABASE_URL` → paste the Supabase Project URL
   - `SUPABASE_ANON_KEY` → paste the anon public key

4. Choose the correct environment (Production/Preview) and click **Save**
5. Trigger a new deployment (**Deployments** tab → **Redeploy** latest)

#### If you deploy with **Netlify**

1. **Open the Netlify Dashboard** → select your RoomLedger site
2. Go to **Site settings** → **Environment variables**
3. Click **Add environment variable** for each item:

   - `SUPABASE_URL` → Supabase Project URL
   - `SUPABASE_ANON_KEY` → Supabase anon public key

4. Save and trigger a new deploy (via **Deploys** tab → **Trigger deploy**) or push a new commit

### Step 3: Deploy / Redeploy

- **Git-based workflow**: commit & push (`git add . && git commit && git push`) to trigger a fresh build
- **Manual redeploy**: use the hosting dashboard’s redeploy button after editing environment variables

### Step 4: Test

1. **Open your deployed site**
2. **Check browser console** - should see "✅ Supabase client initialized successfully"
3. **Try creating a group** - it should work!

## 🔒 **Security Benefits**

✅ **No hardcoded credentials** in client-side code  
✅ **Environment variables** stored securely on your hosting provider
✅ **Server-side loading** of sensitive data
✅ **Automatic redeploy** when you update env vars

## 🚨 Troubleshooting

**Still seeing errors?**
- Double-check environment variable names (exactly `SUPABASE_URL` and `SUPABASE_ANON_KEY`)
- Make sure the values are correct (no extra spaces)
- Wait for the new deployment to complete
- Clear browser cache and refresh

**Need help?**
- **Vercel**: Check the **Functions** tab (if available) or **Deployments logs** for `/api/get-config`
- **Netlify**: Open the **Functions log** for `get-config`
- Verify your project is active in Supabase