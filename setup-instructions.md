# RoomLedger Professional Setup Guide

Follow this guide to configure Supabase, deploy RoomLedger, and verify that everything is working on both **Vercel** and **Netlify**.

## 📁 File Structure

```
roomledger/
├── index.html
├── styles.css
├── api/
│   ├── get-config.js
│   └── smart-settlement.js
├── netlify/
│   └── functions/
│       ├── get-config.js
│       ├── smart-settlement.py
│       └── requirements.txt
├── netlify.toml
├── database_schema.sql
├── SUPABASE_SETUP.md
├── DEPLOYMENT_FIXES.md
├── TEST_SCENARIO.md
└── setup-instructions.md
```

## 🚀 Deployment Workflow

### Step 1 – Create a Supabase Project
1. Visit [supabase.com](https://supabase.com) and create a new project.
2. Choose a strong database password and region close to your users.
3. Wait for initialization to finish.

### Step 2 – Apply the Database Schema
1. Open **SQL Editor** in Supabase.
2. Create a **New query** and paste the contents of `database_schema.sql`.
3. Run the query and confirm all tables, views, and triggers were created successfully.

### Step 3 – Configure Environment Variables
Collect the **Project URL** and **Anon public key** from **Settings → API** in Supabase, then set the following variables on your host:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Vercel:** Project → Settings → Environment Variables → Add the keys → Save.
**Netlify:** Site configuration → Build & deploy → Environment → Add the keys → Save.

Remember to redeploy after updating environment variables so serverless functions pick up the new values.

### Step 4 – Deploy the Frontend & Functions
- **Vercel**
  1. Import the repository (framework preset: **Other**).
  2. No build command needed – the site is static.
  3. Deploy and wait for `api/get-config` to return JSON.

- **Netlify**
  1. Drag & drop the folder or connect the repository.
  2. `netlify.toml` automatically configures redirects and Python runtime.
  3. After deploy, test `/.netlify/functions/get-config` to ensure credentials resolve.

### Step 5 – Verify Serverless APIs
Use your live domain (replace `<host>` with your actual domain):

- Config endpoint: `https://<host>/api/get-config` (Vercel) or `https://<host>/.netlify/functions/get-config` (Netlify)
- Smart settlement endpoint: `https://<host>/api/smart-settlement`
  - On Netlify the `/api/*` path is proxied to the Python function by `netlify.toml`.

You can also POST the example payload from `TEST_SCENARIO.md` to confirm the advanced algorithm works end-to-end.

### Step 6 – Run Through the App
1. Register a new group with name, password, and default currency.
2. Invite roommates and verify they can log in.
3. Add a mix of expenses (different payers, participants, and currencies).
4. Click **Generate Smart Settlement** – ensure results populate and history records update.
5. Test member management actions in the **Manage** tab.

## 🎨 Included Enhancements

- Modern, mobile-first UI with smooth interactions and status messaging.
- Advanced serverless settlement engine with algorithm selection and metrics.
- Secure Supabase integration with automatic environment detection for Vercel/Netlify.
- Extensive database schema featuring categories, recurring expenses, notifications, and audit logging (ready for future upgrades).

## 🔍 Troubleshooting

- **Supabase errors**: confirm environment variables and rerun `database_schema.sql`.
- **Config endpoint fails**: check hosting logs (Vercel functions logs or Netlify function logs) for missing env variables.
- **Smart settlement fallback**: if serverless endpoints fail, the frontend uses the built-in JS algorithm—investigate server logs for root causes.
- **CORS issues on custom domains**: Netlify headers in `netlify.toml` allow cross-origin requests from the app domain; adjust if you proxy through another service.

With these steps complete, your RoomLedger deployment will be conflict-free and ready for real-world roommate expense tracking. ✅

