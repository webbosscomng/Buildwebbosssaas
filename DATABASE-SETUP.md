# Web Boss - Database Setup Guide

Your application is trying to access tables that don't exist yet in your Supabase project. Follow these steps to set up your database.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Click on your project
3. Navigate to the **SQL Editor** in the left sidebar (or go to the Table Editor and click "New Query")

## Step 2: Run the Main Schema

1. Copy the **ENTIRE contents** of the `/schema.sql` file in this project
2. Paste it into the SQL Editor
3. Click **Run** or press `Ctrl/Cmd + Enter`

This will create:
- ✅ All database tables (profiles, pages, page_blocks, analytics_events, leads, subscriptions, themes)
- ✅ Database indexes for performance
- ✅ Triggers for automatic timestamp updates
- ✅ Function to auto-create user profiles on signup
- ✅ Reserved handles list

## Step 3: Enable Row Level Security (RLS)

1. Copy the **ENTIRE contents** of the `/schema-rls.sql` file
2. Paste it into a new SQL Editor query
3. Click **Run** or press `Ctrl/Cmd + Enter`

This will configure:
- ✅ Security policies so users can only access their own data
- ✅ Public read access for published pages
- ✅ Anonymous analytics tracking (write-only for visitors)
- ✅ Anonymous lead submission for contact forms

## Step 4: Create Storage Bucket

1. Navigate to **Storage** in the left sidebar
2. Click **New bucket**
3. Create a bucket named: `pages`
4. Make it **Public** (check the "Public bucket" option)
5. Click **Create bucket**

### Configure Storage Policies

After creating the bucket, you need to add policies:

1. Click on the `pages` bucket
2. Go to **Policies** tab
3. Click **New policy**

#### Policy 1: Allow authenticated users to upload
```sql
-- Name: Authenticated users can upload
-- Operation: INSERT
-- Policy definition:
(bucket_id = 'pages'::text) AND (auth.role() = 'authenticated'::text)
```

#### Policy 2: Allow public read access
```sql
-- Name: Public can view files
-- Operation: SELECT
-- Policy definition:
(bucket_id = 'pages'::text)
```

## Step 5: Verify Setup

After running the SQL scripts, verify everything was created:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ profiles
   - ✅ pages
   - ✅ page_blocks
   - ✅ analytics_events
   - ✅ leads
   - ✅ subscriptions
   - ✅ themes
   - ✅ reserved_handles

3. Go to **Authentication** → **Policies**
4. Confirm that RLS is enabled on all tables

## Step 6: Disable Email Confirmation (Optional - Development Only)

If you're in development and want to skip email confirmation:

1. Go to **Authentication** → **Providers** in Supabase
2. Scroll down to **Auth providers**
3. Click on **Email**
4. **Uncheck** "Confirm email"
5. Click **Save**

⚠️ **IMPORTANT**: Re-enable email confirmation before going to production!

## Step 7: Test Your Application

Now your Web Boss application should work properly:

1. Sign up for a new account
2. The onboarding flow should work without errors
3. Handle availability checking should work
4. Creating your first page should succeed

## Troubleshooting

### Error: "Could not find the table 'public.pages'"
- You haven't run the schema.sql file yet
- Run it in the SQL Editor as shown in Step 2

### Error: "new row violates row-level security policy"
- You haven't run the RLS policies yet
- Run schema-rls.sql as shown in Step 3

### Error: "relation 'auth.users' does not exist"
- This shouldn't happen in Supabase (auth.users is built-in)
- Make sure you're using a Supabase project, not a plain PostgreSQL database

### Signup works but login fails with "Email not confirmed"
- Either confirm your email from the link sent to your inbox
- Or disable email confirmation (Step 6 above)

### Storage/Avatar upload errors
- Make sure you created the `pages` storage bucket (Step 4)
- Verify the bucket is set to public
- Check that storage policies are configured

## What Each Table Does

- **profiles**: User account information and settings
- **pages**: Your link-in-bio pages with handles like @yourname
- **page_blocks**: Content blocks (links, buttons, forms, etc.) on each page
- **analytics_events**: Tracks page views and link clicks
- **leads**: Contact form submissions from visitors
- **subscriptions**: User subscription plans (Free vs Pro)
- **themes**: Custom color themes for pages
- **reserved_handles**: Prevents users from claiming system handles like @admin

## Next Steps

After setup is complete:
1. ✅ Sign up for a new account
2. ✅ Complete the onboarding flow
3. ✅ Create your first page
4. ✅ Add blocks (links, WhatsApp CTA, etc.)
5. ✅ Publish your page at `/@yourhandle`

Need help? Check the console for detailed error messages or review the RLS policies in schema-rls.sql.
