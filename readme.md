# 💰 RoomLedger

**Smart debt tracking for roommates, friends, and families.**

RoomLedger is a lightweight, mobile-friendly web app that helps shared households track informal debts, settle them efficiently, and stay transparent about who owes what.

## 🚀 Key Features

- **Smart Settlement Algorithm** – Reduces many transactions into a handful of optimal payments.
- **Flexible Group Management** – Create a room, invite members, and choose who participates in each bill.
- **Mobile-First Design** – Built for phones first with responsive layouts and large touch targets.
- **Settlement History** – Keep a record of previous settlements and running balances.
- **Currency Aware** – Pick the currency that matches your room; all totals adapt instantly.
- **Hosting Flexibility** – Works on both Vercel (Node) and Netlify (Python) serverless runtimes.

## 📱 Example Scenario

**Five roommates, two nights out:**
- Night 1: Three friends go out. Two pay unequal amounts, one pays later.
- Night 2: All five go out and three cover the bill unevenly.

Instead of juggling spreadsheets, RoomLedger tracks every transaction, calculates net balances, and produces the minimum number of repayments required to make everyone whole.

## 🛠 Quick Setup

1. **Get the files** – Clone or download this repository.
2. **Create Supabase project** – Run `database_schema.sql` inside the Supabase SQL editor.
3. **Add Supabase credentials to your host**:
   - **Vercel:** Project → Settings → Environment Variables → add `SUPABASE_URL` & `SUPABASE_ANON_KEY`.
   - **Netlify:** Site configuration → Build & deploy → Environment → add the same two variables.
4. **Deploy**:
   - **Vercel:** Connect the repo or run `vercel --prod`; verify `/api/get-config` returns JSON.
   - **Netlify:** Push to the linked repo or trigger a deploy in the UI; confirm `/.netlify/functions/get-config` works.

Need more detail? See [setup-instructions.md](setup-instructions.md) and [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## 📁 Repository Files

```
├── index.html                # Main application (Supabase client + UI)
├── styles.css                # Mobile-first styling
├── api/
│   ├── get-config.js         # Vercel function exposing Supabase credentials
│   └── smart-settlement.js   # Node-based advanced settlement engine
├── netlify/
│   └── functions/
│       ├── get-config.js     # Netlify function exposing Supabase credentials
│       ├── smart-settlement.py  # Python advanced settlement engine
│       └── requirements.txt  # Python dependencies (standard library)
├── netlify.toml              # Netlify redirects, headers, and runtime config
├── database_schema.sql       # Full Supabase schema for RoomLedger
├── SUPABASE_SETUP.md         # Secure Supabase environment configuration
├── setup-instructions.md     # Deployment & QA checklist
├── DEPLOYMENT_FIXES.md       # Summary of deployment-related fixes
├── TEST_SCENARIO.md          # Manual end-to-end testing scenario
└── README.md                 # You are here
```

## 🌐 Live Deployment

After deploying to Vercel or Netlify, your app will be available at `https://<your-domain>/`. Test `/api/get-config` (Vercel) or `/.netlify/functions/get-config` (Netlify) if you need to verify credentials quickly.

## 🎯 How It Works

1. **Create Group** – Register a room name, currency, and shared password.
2. **Join Group** – Roommates log in with the shared credentials.
3. **Track Expenses** – Select who participated, who paid, and the amount.
4. **Smart Settlement** – Generate optimized payments to settle the room.
5. **Record & Repeat** – Close settlements, revisit history, and manage members anytime.

## 🔧 Tech Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript (Supabase JS SDK v2).
- **Backend:** Supabase (PostgreSQL + Row Level Security).
- **Serverless:** Node.js functions for Vercel, Python/Node functions for Netlify.
- **Hosting:** Vercel or Netlify – pick the provider that fits your workflow.

## 📊 Smart Algorithm Example

Traditional four-person split = up to 12 payments. RoomLedger usually reduces that to 2–3 payments by matching creditors and debtors intelligently.

## 🔒 Privacy & Security

- Data lives inside your Supabase project.
- RLS policies protect room data per group.
- No personal data leaves your control.
- Simple shared password model keeps onboarding friction-free for trusted roommates.

## 📈 Future Ideas

- Recurring expenses & reminders
- Spending analytics and dashboards
- CSV/Excel export
- Push/email notifications
- Native mobile apps

## 📝 License

This project is open source and available under the MIT License.

