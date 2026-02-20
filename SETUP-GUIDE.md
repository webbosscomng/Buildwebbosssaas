# Web Boss - Complete Setup Guide

Follow these steps to get Web Boss running on your Supabase project.

## 📋 Prerequisites Checklist

- [ ] Active Supabase project
- [ ] Supabase project URL (format: `https://[PROJECT_ID].supabase.co`)
- [ ] Supabase anonymous key (found in Project Settings > API)
- [ ] Supabase service role key (found in Project Settings > API)

## 🚀 Step-by-Step Setup

### Step 1: Configure Environment (Automatic)

When you run this app in Figma Make with Supabase connected, the following environment variables are automatically configured:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

No manual configuration needed! ✨

---

### Step 2: Create Database Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the **ENTIRE** contents of `/schema.sql` file
5. Paste into the SQL Editor
6. Click **Run** (bottom right corner)

**Expected Output:**
```
Success! No rows returned
```

**What this does:**
- Creates 7 main tables (profiles, pages, page_blocks, themes, leads, analytics_events, subscriptions)
- Sets up triggers for automatic timestamps
- Creates reserved handles list
- Adds indexes for performance
- Sets up auto-profile creation on user signup

---

### Step 3: Apply Row Level Security Policies

1. In Supabase SQL Editor, click **New Query** again
2. Copy the **ENTIRE** contents of `/schema-rls.sql` file
3. Paste into the SQL Editor
4. Click **Run**

**Expected Output:**
```
Success! No rows returned
```

**What this does:**
- Enables RLS on all tables
- Creates policies for user-scoped data access
- Allows public read for published pages
- Enables anonymous analytics logging
- Protects user data from unauthorized access

---

### Step 4: Verify Database Setup

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected Tables:**
- `analytics_events`
- `leads`
- `page_blocks`
- `pages`
- `profiles`
- `reserved_handles`
- `subscriptions`
- `themes`

---

### Step 5: Verify RLS is Enabled

Run this query to check RLS status:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true` ✅

---

### Step 6: Test the Application

1. **Sign Up**: Navigate to `/signup` and create an account
   - This should create a profile and free subscription automatically
   
2. **Check Database**: Run this query to verify your profile was created:
   ```sql
   SELECT * FROM profiles;
   SELECT * FROM subscriptions;
   ```

3. **Complete Onboarding**: Go through the 5-step onboarding flow
   - Choose a goal
   - Claim a handle
   - Add WhatsApp (optional)
   - Pick a theme
   - Add first links

4. **Verify Page Creation**: Check your page was created:
   ```sql
   SELECT * FROM pages;
   SELECT * FROM page_blocks;
   ```

---

## 🔧 Storage Bucket Setup (Automatic)

The storage bucket for avatars is **automatically created** when the server starts!

**Bucket Name:** `avatars-webboss-49cc7ee6`

**Configuration:**
- Private bucket (not publicly accessible)
- 5MB file size limit
- Allowed types: PNG, JPEG, JPG, GIF, WebP
- Uses signed URLs for secure access

**No manual setup required!** ✨

---

## 🧪 Testing Checklist

After setup, test these features:

### Authentication
- [ ] Sign up with email/password
- [ ] Log in
- [ ] Log out
- [ ] Profile auto-created on signup
- [ ] Free subscription auto-created

### Onboarding
- [ ] All 5 steps work
- [ ] Handle validation works
- [ ] Reserved handles are blocked
- [ ] Page created after onboarding

### Pages
- [ ] Can view pages in dashboard
- [ ] Can edit page
- [ ] Can toggle publish/unpublish
- [ ] Public page loads at `/@handle`

### Blocks
- [ ] Blocks appear on public page
- [ ] WhatsApp link formats correctly
- [ ] Link blocks open in new tab

### Analytics
- [ ] Page views are logged
- [ ] Link clicks are tracked
- [ ] Analytics dashboard shows data
- [ ] IP addresses are hashed

### Storage
- [ ] Avatar upload works
- [ ] Avatars display on public pages

---

## 🔍 Troubleshooting

### "Permission denied" errors

**Cause:** RLS policies not applied or incorrect

**Solution:**
1. Re-run `/schema-rls.sql` in SQL Editor
2. Check that you're logged in when accessing protected routes
3. Verify your user ID matches the owner_id in the database

### "Handle not available" always shows

**Cause:** Reserved handles table not populated

**Solution:**
```sql
-- Check reserved handles exist
SELECT * FROM reserved_handles;

-- If empty, re-run the INSERT statement from schema.sql
```

### Analytics not recording

**Cause:** Page not published or API endpoint issue

**Solution:**
1. Ensure page `is_published = true`
2. Check browser console for API errors
3. Verify server is running (check `/status` endpoint)

### Avatar upload fails

**Cause:** Storage bucket not created or wrong permissions

**Solution:**
1. Check bucket exists: Go to Supabase > Storage
2. Should see `avatars-webboss-49cc7ee6`
3. If not, restart the server (it auto-creates on startup)

### "User not found" after signup

**Cause:** Trigger not firing or database issue

**Solution:**
```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, re-run trigger creation from schema.sql
```

---

## 📊 Database Monitoring

### Check Total Users
```sql
SELECT COUNT(*) as total_users FROM auth.users;
```

### Check Total Pages
```sql
SELECT COUNT(*) as total_pages FROM pages;
SELECT COUNT(*) as published_pages FROM pages WHERE is_published = true;
```

### Check Analytics Summary
```sql
SELECT 
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'link_click') as link_clicks,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events;
```

### Check Subscription Distribution
```sql
SELECT plan, COUNT(*) as count 
FROM subscriptions 
GROUP BY plan;
```

---

## 🎯 Post-Setup Configuration

### Reserved Handles

You can add more reserved handles:

```sql
INSERT INTO reserved_handles (handle) VALUES
  ('yourcompany'),
  ('yourproduct'),
  ('customhandle')
ON CONFLICT (handle) DO NOTHING;
```

### Custom Theme Presets

Add default themes (optional):

```sql
-- Example: Create a public theme preset
INSERT INTO themes (name, tokens, is_public, owner_id)
VALUES (
  'Nigeria Green',
  '{"primary": "142 76% 36%", "accent": "0 0% 100%"}'::jsonb,
  true,
  (SELECT id FROM auth.users LIMIT 1) -- Replace with admin user ID
);
```

---

## 🔐 Security Checklist

After setup, verify these security measures:

- [ ] RLS enabled on all tables ✅
- [ ] Service role key never exposed to frontend ✅
- [ ] IP addresses are hashed in analytics ✅
- [ ] Users can only access their own data ✅
- [ ] Published pages are read-only for public ✅
- [ ] Storage bucket is private (uses signed URLs) ✅

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs (Dashboard > Logs)
4. Verify SQL queries ran successfully
5. Check that all tables have RLS enabled

---

## ✅ Setup Complete!

Once all steps are complete, you should be able to:

1. ✅ Sign up and log in
2. ✅ Complete onboarding
3. ✅ Create and publish pages
4. ✅ View public pages at `/@handle`
5. ✅ Track analytics
6. ✅ Upload avatars

**Welcome to Web Boss! 🎉**

Start building amazing link-in-bio pages for Nigerian creators!

---

**Next Steps:**
- Customize the landing page
- Add payment integration
- Create more block types
- Build advanced analytics
- Add custom domain verification

Happy building! 🚀
