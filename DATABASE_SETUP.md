# MyPosts App - Database Setup Guide

## Supabase Setup (Free Database)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email (completely free)

### Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Enter project name: `myposts`
4. Enter database password (save this!)
5. Choose region closest to you
6. Click "Create new project"

### Step 3: Get Project Credentials
1. Go to your project dashboard
2. Click "Settings" → "API"
3. Copy these values:
   - **Project URL** (something like: `https://xxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOi...`)

### Step 4: Update Configuration
1. Open `lib/supabase.ts`
2. Replace:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```
   With your actual values:
   ```typescript
   const supabaseUrl = 'https://xxxxxxxx.supabase.co';
   const supabaseAnonKey = 'eyJhbGciOi...your-actual-key';
   ```

### Step 5: Create Database Tables
1. In Supabase dashboard, go to "SQL Editor"
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create posts table
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create likes table
CREATE TABLE likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create database functions for counting
CREATE OR REPLACE FUNCTION increment_posts_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE users SET posts_count = posts_count + 1 WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_posts_count(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for posts table
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for likes table
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Create policies for comments table
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
```

4. Click "Run" to execute the SQL

### Step 6: Test the App
1. Run your app: `npx expo start`
2. Try creating an account on the login screen
3. The account should be created in Supabase!

## Features Implemented

✅ **User Authentication**
- Sign up with email/password
- Sign in/Sign out
- User profiles

✅ **Dynamic Posts**
- Create, read, update, delete posts
- Real-time updates
- Like/unlike posts
- Comments system

✅ **User Profiles**
- Dynamic user information
- Post counts, followers, following
- Profile editing

✅ **Real-time Feed**
- Live updates when new posts are created
- Dynamic like counts
- User interactions

## Cost Breakdown
- **Supabase Free Tier**: $0/month
- **Includes**: 500MB database, 50K monthly users, 5GB bandwidth
- **Perfect for**: Learning, development, small projects

Your app is now fully dynamic with a real database! 🚀
