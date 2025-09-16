# RoomLedger (Next.js + Supabase)

Mobile-first expense sharing for roommates. Create a room, add members, record expenses with flexible payer contributions, and view balances.

## Setup

1) Create a Supabase project and load your existing schema (the tables you provided).
2) In Vercel project settings, add env vars:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

3) Locally, create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4) Install and run
```
npm install
npm run dev
```

## Notes
- Auth is room+password+username (based on your schema). No Supabase Auth needed.
- Add Expense lets you pick who participates, how much each contributed, and auto-splits fairly.
- Balances are computed from `transactions`.

Deploy on Vercel with the same env vars.