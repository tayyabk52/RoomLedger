# 🔧 Supabase Setup Guide

## Quick Setup (2 minutes)

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Click "Settings" (gear icon)** in the left sidebar
3. **Click "API"**
4. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 2: Update index.html

1. **Open `index.html`** in your code editor
2. **Find these lines** (around line 203-204):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. **Replace with your actual values:**
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

### Step 3: Deploy

1. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Add Supabase credentials"
   git push
   ```
2. **Wait for Netlify** to deploy automatically

### Step 4: Test

1. **Open your deployed site**
2. **Try creating a group** - it should work!
3. **Check browser console** - no more Supabase errors

## 🚨 Troubleshooting

**Still seeing errors?**
- Double-check the URL and key are correct
- Make sure there are no extra spaces
- Clear browser cache and refresh

**Need help?**
- Check Supabase dashboard → Logs for database errors
- Verify your project is active in Supabase 