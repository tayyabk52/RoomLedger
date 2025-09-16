# 🔧 Secure Supabase Setup Guide

Follow the steps below to keep your Supabase credentials safe while deploying RoomLedger on **Vercel** or **Netlify**.

## 1. Grab Your Supabase Credentials

1. Sign in at [supabase.com](https://supabase.com/dashboard).
2. Select your project and open **Settings → API**.
3. Copy the following values:
   - **Project URL** (looks like `https://xyzcompany.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 2. Configure Environment Variables

You only need to set two variables: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### If you deploy on Vercel
1. Open your project in the Vercel dashboard.
2. Go to **Settings → Environment Variables**.
3. Add the two keys above for the environments you use (Production/Preview).
4. Click **Save**.

### If you deploy on Netlify
1. Open **Site configuration → Build & deploy → Environment**.
2. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Click **Save**.

> 💡 Tip: Netlify also supports per-branch variables if you want different Supabase projects for preview builds.

## 3. Redeploy After Updating Variables

- **Vercel** – Trigger a redeploy from **Deployments → Redeploy** or push a new git commit.
- **Netlify** – Use **Deploys → Trigger deploy → Deploy site** or push a new git commit.

Redeploying ensures the serverless functions pick up the new credentials.

## 4. Smoke-Test the Configuration

1. Visit your deployed site and check the browser console – you should see `✅ Supabase client initialized successfully`.
2. Fetch the config endpoint manually:
   - Vercel: `https://<your-vercel-domain>/api/get-config`
   - Netlify: `https://<your-netlify-domain>/.netlify/functions/get-config`
3. Create a test group in the UI and ensure login + expense creation work.

## 5. Troubleshooting Checklist

- Double-check variable names are exactly `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Make sure there are no trailing spaces when pasting values.
- Confirm you redeployed after updating environment variables.
- If errors persist, open your hosting logs:
  - Vercel: **Project → Deployments → View Functions Logs**.
  - Netlify: **Site configuration → Functions → Logs**.
- Verify the Supabase project is running and that the database schema has been applied.

With the variables in place, RoomLedger will securely talk to Supabase from either hosting provider. ✅

