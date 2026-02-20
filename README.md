# Web Boss - Nigeria-First Link-in-Bio Builder

A production-ready, full-stack SaaS application built for Nigerian creators and small businesses. Create stunning mini landing pages with link-in-bio functionality, WhatsApp integration, analytics, and more.

## 🎯 Features

### Core Functionality
- ✅ **Link-in-Bio Pages**: Create beautiful, customizable profile pages
- ✅ **Multiple Block Types**: Links, WhatsApp CTAs, Products, Embeds, Contact Forms
- ✅ **Custom Handles**: Claim your unique @handle at webboss.com.ng
- ✅ **Theme System**: Choose from Clean, Midnight, or Vibrant themes
- ✅ **Analytics**: Track page views, link clicks, and visitor behavior
- ✅ **Public & Private Pages**: Draft and publish workflow

### Nigeria-First Features
- 🇳🇬 **WhatsApp Integration**: Automatic Nigerian phone number formatting
- 💰 **NGN Currency Display**: Proper Naira formatting for product prices
- 📱 **Mobile-Optimized**: Fast loading on Nigerian network speeds
- ⏰ **Africa/Lagos Timezone**: Default timezone for Nigerian users

### Technical Features
- 🔐 **Supabase Auth**: Secure authentication with email/password
- 🗄️ **PostgreSQL Database**: Full CRUD with Row Level Security (RLS)
- 📦 **File Storage**: Avatar uploads to Supabase Storage
- 🔒 **Privacy-Compliant Analytics**: IP hashing, anonymous sessions
- 🎨 **Design Token System**: Tailwind CSS v4 with CSS variables

## 🏗️ Architecture

```
Web Boss (React SPA)
├── Frontend (React + React Router + Tailwind CSS)
│   ├── Public Routes: /, /pricing, /login, /signup, /@handle
│   ├── Protected Routes: /app/* (Dashboard, Editor, Analytics, Settings)
│   └── Design System: CSS tokens + UI components
│
├── Backend (Supabase Edge Functions + Hono Server)
│   ├── Auth: Signup, Session Management
│   ├── API: Handle Validation, Analytics, Avatar Upload
│   └── Storage: Avatars bucket with signed URLs
│
└── Database (PostgreSQL with RLS)
    ├── Tables: profiles, pages, page_blocks, themes, leads, analytics_events, subscriptions
    └── Policies: User-scoped access, public read for published pages
```

## 📋 Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Database Setup**: Run the SQL migrations (see below)
3. **Environment Variables**: Supabase URL and keys (configured automatically via Figma Make)

## 🚀 Setup Instructions

### 1. Database Setup

Run these SQL files in your Supabase SQL Editor **in order**:

#### Step 1: Create Schema
```sql
-- Copy and paste contents from /schema.sql
-- This creates all tables, indexes, triggers, and functions
```

#### Step 2: Apply RLS Policies
```sql
-- Copy and paste contents from /schema-rls.sql
-- This enables Row Level Security on all tables
```

### 2. Environment Variables

The following environment variables are automatically configured:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anonymous key (frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server only)

### 3. Storage Bucket

The server automatically creates the `avatars-webboss-49cc7ee6` bucket on startup. No manual configuration needed.

## 📁 Project Structure

```
/
├── schema.sql                    # Database schema
├── schema-rls.sql                # Row Level Security policies
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client + types
│   │   ├── auth.ts              # Authentication helpers
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Nigeria-first utilities
│   ├── app/
│   │   ├── App.tsx              # Main app with routing
│   │   ├── components/
│   │   │   ├── blocks/          # Block renderers
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── FormField.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── MetricCard.tsx
│   │   └── pages/
│   │       ├── LandingPage.tsx
│   │       ├── LoginPage.tsx
│   │       ├── SignupPage.tsx
│   │       ├── PricingPage.tsx
│   │       ├── PublicProfilePage.tsx
│   │       ├── Dashboard.tsx
│   │       ├── OnboardingPage.tsx
│   │       ├── PageEditorPage.tsx
│   │       ├── ThemeEditorPage.tsx
│   │       ├── AnalyticsPage.tsx
│   │       └── SettingsPage.tsx
│   └── styles/
│       ├── tokens.css           # Design tokens
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
└── supabase/
    └── functions/
        └── server/
            └── index.tsx        # Hono API server
```

## 🎨 Design System

### Color Tokens
- **Primary**: Purple accent (#9B59D0)
- **Backgrounds**: --bg, --card, --muted
- **Foregrounds**: --fg, --muted-fg
- **States**: --destructive, --success, --warning, --info

### Theme Presets
1. **Clean**: Simple and professional (default)
2. **Midnight**: Dark and elegant
3. **Vibrant**: Colorful and bold

### Customization
Themes can be applied via `data-theme` attribute or by selecting in the theme editor.

## 🔐 Security

### Row Level Security (RLS)
All tables have RLS enabled with strict policies:
- Users can only access their own data
- Published pages are publicly readable
- Analytics can be inserted anonymously
- Leads can be submitted to published pages only

### Privacy-Compliant Analytics
- IP addresses are hashed (SHA-256) before storage
- Anonymous session IDs (no PII)
- No tracking across pages
- User can see only their own analytics

### Authentication
- Secure email/password authentication via Supabase Auth
- Session management with automatic token refresh
- Protected routes require authentication

## 📊 Database Schema

### Main Tables

#### `profiles`
User profile information
- Links to `auth.users` with cascade delete
- Stores name, email, phone, timezone

#### `pages`
Link-in-bio pages
- Unique handle validation (3-30 chars, lowercase, numbers, underscores)
- Theme preset selection
- Publish/draft workflow
- Custom domain support (UI only, DNS verification stubbed)

#### `page_blocks`
Content blocks for pages
- Types: link, whatsapp_cta, product, social_row, embed, contact_form, announcement, text, divider
- Sortable via `sort_order`
- Enable/disable toggle

#### `analytics_events`
Privacy-compliant event tracking
- Event types: page_view, link_click
- Hashed IP, session ID, device type, referrer
- Associated with page and optional block

#### `leads`
Contact form submissions
- Stores name, email, phone, message
- Linked to page
- Only page owner can read

#### `subscriptions`
Plan management (feature gating only)
- Plans: free, pro
- No payment integration yet (stub for future)

## 🚦 User Flows

### 1. Sign Up & Onboarding
1. User signs up with email/password
2. Server creates profile + free subscription
3. Redirect to 5-step onboarding:
   - Choose goal (Creator/Business/Coach)
   - Claim unique handle
   - Add WhatsApp number (optional)
   - Select theme preset
   - Add page title, bio, first link
4. Page created, redirect to editor

### 2. Page Management
1. Dashboard shows all user pages
2. Click "Edit" to open block editor
3. Add/reorder/toggle blocks
4. Preview in mobile frame
5. Publish when ready

### 3. Analytics
1. Page views logged on public page load
2. Link clicks tracked on block interaction
3. Dashboard shows:
   - Total views, clicks, unique visitors
   - Activity by day
   - Plan-based retention (7 days free, 365 days pro)

## 🎯 Feature Gating (Free vs Pro)

### Free Plan
- 1 page
- Up to 10 blocks per page
- webboss.com.ng domain only
- Basic analytics (7 days)
- Watermark badge

### Pro Plan (₦5,000/month)
- Up to 10 pages
- Unlimited blocks
- Custom domain support
- Full analytics (365 days)
- Remove watermark
- Priority support

## 🌐 Public Pages

Public pages are accessible at `/@handle`:
- Fast, SEO-friendly rendering
- Anonymous analytics tracking
- No authentication required
- Blocks render based on type and settings

## 🔧 API Endpoints

### Server Routes (`/functions/v1/make-server-49cc7ee6/...`)

#### Public
- `POST /auth/signup` - Create account
- `GET /handles/:handle/available` - Check handle availability
- `POST /analytics/event` - Log analytics event (page_view, link_click)

#### Authenticated
- `GET /analytics/:pageId/summary?days=7` - Get analytics summary
- `POST /storage/avatar` - Upload avatar
- `GET /storage/avatar/:userId/:pageId/*` - Get signed avatar URL

## 🎨 Styling

### Tailwind CSS v4
- CSS variables for tokens in `/src/styles/tokens.css`
- No `tailwind.config.js` needed (using Tailwind v4)
- Responsive utilities throughout

### Component Library
Uses shadcn/ui components:
- Button, Card, Input, Textarea, Select, etc.
- All styled with Tailwind + design tokens

## 📝 TODOs & Future Enhancements

### High Priority
- [ ] Complete block editor (add/edit/delete blocks)
- [ ] Drag-and-drop block reordering
- [ ] Custom domain DNS verification
- [ ] Payment integration (Paystack for NGN)
- [ ] Email notifications
- [ ] Social login (Google, Facebook)

### Medium Priority
- [ ] Advanced analytics charts (Recharts integration)
- [ ] Export leads to CSV
- [ ] Page templates
- [ ] Duplicate page functionality
- [ ] QR code generation for pages

### Low Priority
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Team collaboration
- [ ] API access for developers
- [ ] Webhooks

## 🐛 Debugging

### Common Issues

1. **Authentication Errors**
   - Check Supabase URL and keys in environment
   - Ensure RLS policies are applied correctly
   - Verify user exists in `auth.users` table

2. **Handle Availability Always False**
   - Check `reserved_handles` table
   - Verify API endpoint is reachable
   - Check browser console for errors

3. **Analytics Not Recording**
   - Ensure page is published (`is_published = true`)
   - Check RLS policies on `analytics_events`
   - Verify API endpoint in browser network tab

4. **Avatar Upload Fails**
   - Check storage bucket exists: `avatars-webboss-49cc7ee6`
   - Verify service role key is set on server
   - Check file size limit (5MB)

## 🤝 Contributing

This is a production-ready prototype. Key areas for contribution:
1. Block editor UI/UX improvements
2. Analytics visualization
3. Payment integration
4. Mobile app (React Native)

## 📄 License

Proprietary - Web Boss © 2026

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

**Made in Nigeria 🇳🇬 for Nigerian Creators**

For support, contact: support@webboss.com.ng
