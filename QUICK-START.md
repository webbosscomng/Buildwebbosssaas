# Web Boss - Quick Start Guide

## 🚨 IMPORTANT: Database Setup Required

Before your app will work, you MUST set up the database in Supabase. This takes about 5 minutes.

## ⚡ Fast Setup (3 Steps)

### 1️⃣ Run Schema SQL

1. Open your Supabase project at https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Copy ALL contents from `/schema.sql` in this project
4. Paste into SQL Editor and click **Run**

### 2️⃣ Run RLS Policies

1. In SQL Editor, create a new query
2. Copy ALL contents from `/schema-rls.sql` in this project
3. Paste and click **Run**

### 3️⃣ Create Storage Bucket

1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name it: `pages`
4. Check **Public bucket**
5. Click **Create**

**Then add storage policies:**

Go to the `pages` bucket → **Policies** tab → Add these two policies:

**Policy 1 - Allow uploads (INSERT):**
```sql
(bucket_id = 'pages'::text) AND (auth.role() = 'authenticated'::text)
```

**Policy 2 - Allow public read (SELECT):**
```sql
(bucket_id = 'pages'::text)
```

## ✅ That's It!

Now your app should work. Try:
1. Sign up for a new account
2. Go through onboarding
3. Create your first page

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| `Could not find the table 'public.pages'` | You didn't run schema.sql yet |
| `Email not confirmed` | Check your email OR disable email confirmation in Supabase Auth settings |
| `new row violates row-level security policy` | You didn't run schema-rls.sql yet |
| Avatar upload fails | You didn't create the `pages` storage bucket |

## 📚 Detailed Instructions

See `/DATABASE-SETUP.md` for detailed setup instructions with screenshots and troubleshooting.

## 🔧 Development Tips

### Skip Email Confirmation (Dev Only)

In Supabase Dashboard:
1. **Authentication** → **Providers**
2. Click **Email**
3. Uncheck "Confirm email"
4. Click **Save**

⚠️ Remember to re-enable this before production!

### Check Database Is Working

After setup, verify in Supabase:
- **Table Editor** - should see 7+ tables
- **Authentication** → **Policies** - should see multiple RLS policies
- **Storage** - should see `pages` bucket

## 🎯 What Gets Created

The SQL scripts create:

**Tables:**
- `profiles` - User accounts
- `pages` - Your link-in-bio pages
- `page_blocks` - Content blocks
- `analytics_events` - View/click tracking
- `leads` - Contact form submissions
- `subscriptions` - Free/Pro plans
- `themes` - Custom color themes
- `reserved_handles` - Protected handles

**Features:**
- Auto-create profile on signup
- Auto-create free subscription
- Secure row-level security
- Public pages at `/@handle`
- Private analytics
- Multi-tenant support

## 🆘 Still Having Issues?

1. Check browser console for detailed errors
2. Check Supabase logs in Dashboard
3. Verify all SQL ran without errors
4. Make sure you're using the correct Supabase project

---

**Ready to build?** Run the SQL, create the bucket, and start building your link-in-bio empire! 🚀
