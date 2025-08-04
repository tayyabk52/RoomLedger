# 🔧 Secure Supabase Setup Guide

## 🔒 **Security-First Approach**

Your Supabase credentials are now loaded **securely** from Netlify environment variables, not hardcoded in the client-side code.

## Quick Setup (2 minutes)

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Click "Settings" (gear icon)** in the left sidebar
3. **Click "API"**
4. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 2: Set Netlify Environment Variables

1. **Go to your Netlify dashboard**
2. **Click on your RoomLedger site**
3. **Go to "Site settings" (gear icon)**
4. **Click on "Environment variables"**
5. **Add these variables:**

   **Variable 1:**
   - **Key:** `SUPABASE_URL`
   - **Value:** Your Supabase project URL
   - **Scope:** Production

   **Variable 2:**
   - **Key:** `SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon public key
   - **Scope:** Production

### Step 3: Deploy

1. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Add secure environment variable loading"
   git push
   ```
2. **Wait for Netlify** to deploy automatically

### Step 4: Test

1. **Open your deployed site**
2. **Check browser console** - should see "✅ Supabase client initialized successfully"
3. **Try creating a group** - it should work!

## 🔒 **Security Benefits**

✅ **No hardcoded credentials** in client-side code  
✅ **Environment variables** stored securely on Netlify  
✅ **Server-side loading** of sensitive data  
✅ **Automatic deployment** when you update env vars  

## 🚨 Troubleshooting

**Still seeing errors?**
- Double-check environment variable names (exactly `SUPABASE_URL` and `SUPABASE_ANON_KEY`)
- Make sure the values are correct (no extra spaces)
- Wait for the new deployment to complete
- Clear browser cache and refresh

**Need help?**
- Check Netlify function logs for `/api/get-config` errors
- Verify your project is active in Supabase 