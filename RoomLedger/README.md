# RoomLedger

A mobile-first expense sharing app designed for roommates to easily split bills and track debts. Built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🏠 **Room-based Groups**: Create or join rooms using simple room codes
- 💰 **Smart Bill Splitting**: Automatically calculate fair shares even when people pay different amounts
- 📱 **Mobile-First Design**: Optimized for mobile use with a responsive design
- 👥 **Multi-User Support**: Track expenses across multiple roommates
- 💳 **Payment Tracking**: Record payments and automatically calculate who owes what
- 🔄 **Real-time Balance Calculation**: See your current balance and debts instantly
- 🌍 **Multi-Currency Support**: Support for USD, EUR, GBP, INR, CAD, AUD
- 🔐 **Secure Authentication**: User registration and login system

## How It Works

1. **Create or Join a Room**: Start by creating a room or joining an existing one with a room code
2. **Add Bills**: Create bills for shared expenses (groceries, restaurants, utilities, etc.)
3. **Select Participants**: Choose who participated in each expense
4. **Record Payments**: Track who paid what amount
5. **Automatic Calculations**: The app automatically calculates fair shares and balances
6. **Settle Up**: See who owes what to whom and settle debts

## Example Scenario

- 3 roommates go out to eat (Total bill: $60)
- Alice pays $40, Bob pays $20, Charlie pays $0
- RoomLedger calculates each person owes $20
- Result: Charlie owes Alice $20, Alice gets $20 back, Bob is even

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with bcrypt
- **Deployment**: Vercel
- **UI Components**: Lucide React icons, React Hook Form
- **State Management**: React Context API

## Database Schema

The app uses a comprehensive database schema with the following tables:

- **users**: User accounts and authentication
- **rooms**: Shared living spaces/groups
- **room_members**: Many-to-many relationship between users and rooms
- **bills**: Shared expenses
- **bill_participants**: Who participates in each bill
- **payments**: Payment records
- **settlements**: Debt settlements between users

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RoomLedger
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Create a new Supabase project
- Run the SQL schema from `supabase_schema.sql` in your Supabase SQL editor
- This will create all necessary tables, indexes, and functions

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment on Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Configure environment variables in Vercel:
   - Go to your project settings
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy:
   - Vercel will automatically deploy your app
   - Any push to your main branch will trigger a new deployment

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to the SQL Editor and run the schema from `supabase_schema.sql`

3. Get your project credentials:
   - Project URL: Found in Settings > API
   - Anon key: Found in Settings > API

4. Configure Row Level Security (RLS) policies as needed for your use case

## Mobile App Features

- **Responsive Design**: Works perfectly on mobile devices
- **Touch-Friendly**: Large buttons and easy navigation
- **Progressive Web App**: Can be installed on mobile devices
- **Offline-Ready**: Basic functionality works offline

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@roomledger.com or create an issue in the repository.

---

Made with ❤️ for roommates who want to split bills fairly and easily.