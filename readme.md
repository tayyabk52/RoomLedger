# 💰 RoomLedger

**Smart debt tracking for families & roommates**

RoomLedger is a lightweight, mobile-friendly web app that helps families, roommates, and shared households track informal debts and settle them efficiently.

## 🚀 Key Features

- **Smart Settlement Algorithm**: Reduces multiple transactions into minimum payments
- **Simple Group Management**: One person creates, everyone joins with shared password
- **Mobile-First Design**: Works perfectly on phones and tablets
- **Settlement History**: Track all past settlements
- **Flexible Expense Splitting**: Split bills between selected group members
- **Real-time Balances**: See who owes what instantly
- **Room Preferences**: Name your room and pick the currency that fits your household

## 📱 Example Scenario

**Jim, Alex, Tim, and Ali go out:**
- Jim pays ₹500 for Uber
- Alex pays ₹600 for dinner
- Tim pays ₹200 for drinks
- Tim pays ₹350 for return Uber

**Instead of 6 separate transactions**, RoomLedger calculates just **2 optimal payments** to settle everyone!

## 🛠 Quick Setup

1. **Get the files**: Download the repository (keep folder structure intact)
2. **Setup Supabase**: Create free project and run the database schema
3. **Update config**: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your Vercel project environment variables
4. **Deploy**: Push to GitHub and connect to Vercel (or redeploy from the dashboard)

**Detailed setup instructions**: See [setup-instructions.md](setup-instructions.md)

## 📁 Repository Files

```
├── index.html              # Main application (reads Supabase config at runtime)
├── styles.css              # Mobile-first styling
├── api/
│   ├── get-config.js       # Serverless function exposing environment variables
│   └── smart-settlement.js # Advanced settlement engine (Vercel function)
├── database_schema.sql     # Full Supabase schema for the app
├── SUPABASE_SETUP.md       # Secure Supabase configuration guide
├── setup-instructions.md   # Detailed setup guide
├── DEPLOYMENT_FIXES.md     # Common deployment troubleshooting notes
├── TEST_SCENARIO.md        # End-to-end manual testing scenario
└── README.md               # This file
```

## 🌐 Live Demo

After setup, your app will be available at your hosting URL (for example `https://your-app.vercel.app`).

## 🎯 How It Works

1. **Create Group**: One person registers, names the shared room, chooses a currency, and adds family/roommate names
2. **Shared Access**: Everyone uses the same group password to login
3. **Track Expenses**: Anyone can add expenses and split them
4. **Smart Settlement**: App calculates the minimum payments needed
5. **Record & Repeat**: Confirm settlements, tweak settings anytime, and maintain history

## 🔧 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: Vercel (static hosting + serverless functions)
- **Authentication**: Simple shared password system

## 📊 Smart Algorithm Example

**Traditional way**: 4 people = up to 12 possible transactions  
**RoomLedger way**: Same 4 people = usually just 2-3 payments needed

The app automatically calculates the optimal payment flow to settle all debts with minimum transactions.

## 🔒 Privacy & Security

- All data stored securely in Supabase
- Row Level Security enabled
- Simple authentication designed for trusted groups
- No complex user management needed

## 📈 Future Features

- Recurring expenses
- Category-based spending analysis
- Export settlement history
- Group spending insights
- Mobile app versions

## 📝 License

This project is open source and available under the MIT License.

---

**Ready to deploy?** Check out [setup-instructions.md](setup-instructions.md) for the complete guide!