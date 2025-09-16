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

1. **Get the files**: Download the 3 files from this repository
2. **Setup Supabase**: Create free project and run the database schema
3. **Update config**: Add your Supabase credentials to index.html
4. **Deploy**: Push to GitHub and connect to Netlify (or direct upload)

**Detailed setup instructions**: See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

## 📁 Repository Files

```
├── index.html              # Main application (update with your Supabase config)
├── netlify.toml            # Netlify deployment configuration
├── database_schema.sql     # Supabase database setup
├── SETUP_INSTRUCTIONS.md   # Detailed setup guide
└── README.md              # This file
```

## 🌐 Live Demo

After setup, your app will be available at your Netlify URL (like `https://your-app.netlify.app`)

## 🎯 How It Works

1. **Create Group**: One person registers, names the shared room, chooses a currency, and adds family/roommate names
2. **Shared Access**: Everyone uses the same group password to login
3. **Track Expenses**: Anyone can add expenses and split them
4. **Smart Settlement**: App calculates the minimum payments needed
5. **Record & Repeat**: Confirm settlements, tweak settings anytime, and maintain history

## 🔧 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: Netlify
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

**Ready to deploy?** Check out [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for the complete guide!