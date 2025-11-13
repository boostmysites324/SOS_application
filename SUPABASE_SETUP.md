# Supabase Setup Guide

This guide will help you set up Supabase for the Employee SOS Application.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Employee SOS App (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## 3. Run the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `server/supabase-schema.sql`
4. Click "Run" to execute the schema
5. Verify the tables were created by going to **Table Editor**

## 4. Configure Environment Variables

1. Copy `server/env.example` to `server/.env`
2. Fill in your Supabase credentials:

```env
PORT=4000
JWT_SECRET=your-secure-random-secret-key-here
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Never commit your `.env` file to version control
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) - keep it secret
- Use a strong, random `JWT_SECRET` in production

## 5. Create Your First Admin User

After setting up the database, you'll need to create an admin user. You can do this in two ways:

### Option A: Using Supabase Dashboard (SQL)

1. Go to **SQL Editor** in Supabase
2. Run this query (replace with your values):

```sql
-- First, insert a user (you'll need to hash the password)
-- Use the backend to register a user first, then update their role:

UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Option B: Using the Application

1. Register a new user through the app
2. In Supabase dashboard, go to **Table Editor** → **users**
3. Find your user and change the `role` field from `employee` to `admin`

## 6. Set Up Row Level Security (RLS) - Optional

For additional security, you can set up Row Level Security policies in Supabase. However, since we're using the service role key in the backend, RLS is bypassed. If you want to use RLS:

1. Go to **Authentication** → **Policies** in Supabase
2. Create policies for each table to control access
3. Note: This requires using the anon key and implementing proper authentication

## 7. Test the Connection

1. Start your backend server:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. Check the health endpoint:
   ```bash
   curl http://localhost:4000/api/health
   ```

3. Try registering a user through the frontend

## Troubleshooting

### "Invalid API key" error
- Double-check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Make sure there are no extra spaces in your `.env` file

### "relation does not exist" error
- Make sure you ran the `supabase-schema.sql` file
- Check the Table Editor to verify tables exist

### "permission denied" error
- Ensure you're using the SERVICE_ROLE_KEY, not the ANON_KEY
- Check that the service role key has the correct permissions

## Next Steps

1. Set up email service for verification emails (see `server/src/utils/email.js`)
2. Configure push notifications (Firebase Cloud Messaging, etc.)
3. Set up SMS notifications (Twilio, etc.) for emergency contacts
4. Deploy your backend to a hosting service (Heroku, Railway, AWS, etc.)

## Security Notes

- Always use environment variables for sensitive data
- Never expose the SERVICE_ROLE_KEY in client-side code
- Use HTTPS in production
- Regularly rotate your API keys
- Monitor your Supabase usage and set up alerts

