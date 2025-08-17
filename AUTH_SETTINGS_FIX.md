# Quick Fix: Check Supabase Auth Settings

## The Issue
Your account creation says "successful" in demo mode, but we need to get it working with real Supabase to see users in your database table.

## Step 1: Check Authentication Settings
1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `tngjmzywpcgcxwxcpdrm`
3. **Click "Authentication"** in left sidebar
4. **Click "Settings"** tab

## Step 2: Disable Email Confirmation
Look for these settings and make sure they are:
- ✅ **"Enable email confirmations"** = **OFF** (TURN THIS OFF)
- ✅ **"Enable signup"** = **ON**
- ✅ **"Enable email provider"** = **ON**

## Step 3: Check Site URL
In the same settings page:
- Set **"Site URL"** to: `http://localhost:8081`

## Step 4: Test Again
After making these changes:
1. **Refresh your app** (press 'r' in Expo or reload browser)
2. **Try signing up** with:
   - Email: `rifaf@gmail.com`
   - Password: `123456`
   - Username: `rifaf`
   - Full Name: `Rifaf Rahman`

## What Should Happen:
1. ✅ **No email validation error**
2. ✅ **User appears in Authentication > Users**
3. ✅ **User appears in your users table**
4. ✅ **You're automatically signed in**

## If Still Getting Email Validation Error:
The issue might be that Supabase has strict email validation enabled. Try:
1. **Different email format**: `test@example.com`
2. **Check console logs** for detailed error
3. **Verify API key** is correct in your app

The key is disabling email confirmation in your Supabase dashboard!
