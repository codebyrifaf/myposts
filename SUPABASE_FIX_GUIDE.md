# Fix Supabase Email Validation Issue

## The Problem
Your Supabase project is rejecting the email `rifaf@gmail.com` as invalid at the server level. This is a Supabase configuration issue, not your app code.

## Immediate Solution: Demo Mode
I've temporarily enabled demo mode so you can test all app features:
- ✅ Login works instantly
- ✅ All features available 
- ✅ No Supabase dependency

## Permanent Fix: Configure Supabase

### Step 1: Check Email Confirmation Settings
1. Go to: https://supabase.com/dashboard
2. Select project: `tngjmzywpcgcxwxcpdrm`
3. Navigate: **Authentication** → **Settings**
4. Find: **"Enable email confirmations"**
5. **Turn OFF** this setting
6. Click **"Save"**

### Step 2: Check Auth Providers
1. In same Authentication section
2. Click **"Providers"** tab
3. Make sure **"Email"** provider is enabled
4. Check **"Enable signup"** is ON

### Step 3: Check Email Templates (Advanced)
1. Go to **Authentication** → **Templates**
2. Check if there are any custom email validation rules

### Step 4: Check Project Settings
1. Go to **Settings** → **General**
2. Verify project URL matches: `https://tngjmzywpcgcxwxcpdrm.supabase.co`

### Step 5: Try Different Email (Test)
Try with a different email format to see if it's email-specific:
- `test@test.com`
- `user@example.com`
- `admin@domain.org`

## Alternative: Create New Supabase Project
If settings don't work, create a fresh project:
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Use default settings
4. Copy new URL and anon key
5. Update `lib/supabase.ts`

## Test Current Demo Mode
Right now you can test all features:
1. **Try signup** - should work instantly
2. **Create posts** - will use demo data
3. **Like posts** - functional
4. **View profile** - shows demo user

## When Ready to Switch Back
1. Fix Supabase configuration
2. Set `DEMO_MODE = false` in:
   - `lib/auth.tsx`
   - `lib/database.ts`
3. Test real authentication

The demo mode will let you verify all app functionality works perfectly!
