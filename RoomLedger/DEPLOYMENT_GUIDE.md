# RoomLedger Deployment Guide

## Quick Deployment Steps

### 1. Set up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `supabase_schema.sql` 
4. Run the SQL to create all tables, indexes, views, and functions
5. Note down your project URL and anon key from Settings > API

### 2. Deploy to Vercel

1. Push this code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com) and create a new project
3. Import your repository
4. Add these environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Deploy!

### 3. Test the Application

1. Visit your deployed URL
2. Create a new account
3. Create a room with code "TEST123"
4. Create a test bill and add payments
5. Verify the balance calculations work correctly

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Setup Details

The `supabase_schema.sql` file contains:
- All table definitions with proper relationships
- Indexes for optimal performance  
- Views for complex queries
- Functions for balance calculations
- Triggers for automatic timestamps

## Features Included

✅ User authentication and registration
✅ Room creation and joining with codes
✅ Bill creation with participant selection
✅ Payment tracking and recording
✅ Automatic balance calculations
✅ Mobile-first responsive design
✅ Multi-currency support
✅ Real-time debt tracking
✅ Settings and room management

## Mobile PWA

The app is configured as a Progressive Web App and can be installed on mobile devices for a native-like experience.

## Support

For issues or questions:
- Check the main README.md for detailed documentation
- Review the code comments for implementation details
- Verify your Supabase setup matches the schema exactly

The application is now ready for production use!