# Web Boss - Quick Start Guide

Get Web Boss running in under 10 minutes! ⚡

## ⚡ Speed Run Setup

### 1. Prerequisites (1 minute)

✅ You need:
- Active Supabase project
- Supabase credentials (URL + keys)
- This project open in Figma Make

### 2. Database Setup (3 minutes)

**Copy & paste these two SQL files in Supabase SQL Editor:**

1. Open [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor
2. Paste contents of `schema.sql` → Click **Run** ✅
3. Paste contents of `schema-rls.sql` → Click **Run** ✅

**Done!** Your database is ready 🎉

### 3. Run the App (1 minute)

The app is now running! Since you're in Figma Make with Supabase connected, everything is configured automatically.

### 4. Create Your First Account (2 minutes)

1. Click **Sign Up** 
2. Enter email, password, and name
3. Complete the 5-step onboarding
4. Your first page is live at `/@yourhandle` 🚀

### 5. Publish Your Page (2 minutes)

1. Go to Dashboard
2. Click "Edit" on your page
3. Toggle "Publish" ✅
4. Share `webboss.com.ng/@yourhandle`

**Congrats!** You're now a Web Boss 🎉

---

## 🎓 Next Steps

### Learn the Basics (10 minutes)

1. **Add More Blocks**
   - Click "+ Add Block" in editor
   - Try WhatsApp CTA, Links, Products
   - Drag to reorder (coming soon)

2. **Customize Your Theme**
   - Click "Theme" button
   - Choose Clean, Midnight, or Vibrant
   - See instant preview

3. **Check Analytics**
   - Click "Analytics" button
   - See views, clicks, visitors
   - Free plan: 7 days of data

4. **Update Settings**
   - Go to Settings
   - Update profile info
   - Change password

---

## 🧪 Test Drive Features

### Try WhatsApp Integration
```
1. Add WhatsApp CTA block
2. Enter: 08012345678
3. Publish page
4. Click button on public page
5. Opens WhatsApp with your number!
```

### Try Product Block
```
1. Add Product block
2. Name: "My Product"
3. Price: 5000 (auto-formats to ₦5,000)
4. WhatsApp: 08012345678
5. Publish → Visitors can order via WhatsApp!
```

### Try Analytics
```
1. Share your page link
2. Click it a few times
3. Check Analytics dashboard
4. See views & clicks tracked!
```

---

## 🎯 Common Tasks

### How to Add a New Page
```
1. Dashboard → "Create Page"
2. Complete onboarding again (faster flow coming)
3. Or manually create in database (advanced)
```

### How to Change Your Handle
```
Currently: Edit in database
Coming soon: Settings → Change Handle
```

### How to Delete a Page
```
1. Dashboard → Page settings
2. Click "Delete Page"
Coming soon: Trash/archive system
```

### How to Upgrade to Pro
```
1. Pricing page → "Upgrade to Pro"
2. Payment integration coming soon
3. For now: Manual upgrade in database
```

---

## 🐛 Troubleshooting

### "Handle not available" always shows
**Fix:** Re-run `schema.sql` to populate reserved_handles

### Can't sign up
**Fix:** Check Supabase Auth is enabled in Dashboard → Authentication

### Page not showing at /@handle
**Fix:** Make sure `is_published = true` in database

### Analytics not recording
**Fix:** 
1. Ensure page is published
2. Check browser console for errors
3. Verify RLS policies ran successfully

---

## 📚 Learn More

- **Full Guide:** See [SETUP-GUIDE.md](./SETUP-GUIDE.md)
- **API Docs:** See [API-REFERENCE.md](./API-REFERENCE.md)
- **Roadmap:** See [ROADMAP.md](./ROADMAP.md)
- **README:** See [README.md](./README.md)

---

## 💬 Get Help

- **Documentation:** All .md files in this project
- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com
- **Tailwind CSS:** https://tailwindcss.com

---

## 🎉 You're All Set!

You now have a fully functional link-in-bio platform. Time to:

1. ✅ Build your first page
2. ✅ Share it with the world
3. ✅ Track your analytics
4. ✅ Grow your audience

**Welcome to Web Boss!** 🚀

Made in Nigeria 🇳🇬 for Nigerian Creators
