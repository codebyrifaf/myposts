# Database Setup Instructions

## The Problem
The email validation error is likely caused by missing database tables. When Supabase tries to create a user profile, it fails because the `users` table doesn't exist.

## Quick Fix Steps:

### 1. Set up Database Tables
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `tngjmzywpcgcxwxcpdrm`
3. Click **"SQL Editor"** in the left sidebar
4. Copy and paste this SQL code:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for posts table
CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for likes table  
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);
```

5. Click **"RUN"** to execute the SQL

### 2. Test Sign Up Again
After running the SQL:
1. Refresh your app (press 'r' in Expo terminal or reload browser)
2. Try signing up with:
   - Email: `rifaf@gmail.com`
   - Password: `123456` (at least 6 characters)
   - Username: `rifaf`
   - Full Name: `Rifaf Rahman`

### 3. Check Browser Console
Open browser developer tools (F12) and check the Console tab for any error messages.

## What I Fixed:
1. ✅ Removed strict email validation that was incorrectly rejecting valid emails
2. ✅ Added better error logging to show actual Supabase errors  
3. ✅ Made profile creation non-blocking (signup succeeds even if profile fails)
4. ✅ Added database table setup instructions

The "Email address is invalid" error should be gone after setting up the database tables!
