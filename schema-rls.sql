-- Web Boss - Row Level Security (RLS) Policies
-- Run this AFTER creating the schema with schema.sql
--
-- SECURITY MODEL:
-- - Users can only access their own data
-- - Published pages and their blocks are publicly readable
-- - Analytics events can be inserted anonymously but only read by page owner
-- - Leads can be submitted anonymously but only read by page owner

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (triggered automatically, but allow manual too)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = owner_id);

-- Only service role can insert/update subscriptions (or allow user insert for free plan)
CREATE POLICY "Users can create own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own subscription (for plan changes)
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- PAGES POLICIES
-- ============================================================================

-- Owners can view their own pages
CREATE POLICY "Owners can view own pages"
  ON pages FOR SELECT
  USING (auth.uid() = owner_id);

-- Public can view published pages only
CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  USING (is_published = true);

-- Owners can insert their own pages
CREATE POLICY "Owners can insert own pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own pages
CREATE POLICY "Owners can update own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = owner_id);

-- Owners can delete their own pages
CREATE POLICY "Owners can delete own pages"
  ON pages FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- THEMES POLICIES
-- ============================================================================

-- Owners can view their own themes
CREATE POLICY "Owners can view own themes"
  ON themes FOR SELECT
  USING (auth.uid() = owner_id);

-- Public can view public themes
CREATE POLICY "Public can view public themes"
  ON themes FOR SELECT
  USING (is_public = true);

-- Owners can insert their own themes
CREATE POLICY "Owners can insert own themes"
  ON themes FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own themes
CREATE POLICY "Owners can update own themes"
  ON themes FOR UPDATE
  USING (auth.uid() = owner_id);

-- Owners can delete their own themes
CREATE POLICY "Owners can delete own themes"
  ON themes FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- PAGE_BLOCKS POLICIES
-- ============================================================================

-- Owners can view blocks for their own pages
CREATE POLICY "Owners can view own page blocks"
  ON page_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_blocks.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Public can view enabled blocks for published pages
CREATE POLICY "Public can view published page blocks"
  ON page_blocks FOR SELECT
  USING (
    is_enabled = true
    AND EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_blocks.page_id
      AND pages.is_published = true
    )
  );

-- Owners can insert blocks for their own pages
CREATE POLICY "Owners can insert own page blocks"
  ON page_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_blocks.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can update blocks for their own pages
CREATE POLICY "Owners can update own page blocks"
  ON page_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_blocks.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can delete blocks for their own pages
CREATE POLICY "Owners can delete own page blocks"
  ON page_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_blocks.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- LEADS POLICIES
-- ============================================================================

-- Public can submit leads to any published page
CREATE POLICY "Public can submit leads"
  ON leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = leads.page_id
      AND pages.is_published = true
    )
  );

-- Owners can view leads for their own pages
CREATE POLICY "Owners can view own page leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = leads.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Owners can delete leads from their own pages
CREATE POLICY "Owners can delete own page leads"
  ON leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = leads.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- ANALYTICS_EVENTS POLICIES
-- ============================================================================

-- Public (anonymous) can insert analytics events for any published page
CREATE POLICY "Public can log analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = analytics_events.page_id
      AND pages.is_published = true
    )
  );

-- Owners can view analytics for their own pages
CREATE POLICY "Owners can view own page analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = analytics_events.page_id
      AND pages.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STORAGE POLICIES (for avatars bucket)
-- ============================================================================
-- Note: These need to be created via Supabase dashboard or API
-- The server will create the bucket programmatically

-- Storage bucket name: avatars-webboss-49cc7ee6
-- 
-- Policy: Authenticated users can upload to their own folder
-- (auth.uid() = (storage.foldername(name))[1])
--
-- Policy: Public can read published page avatars
-- (Requires lookup or use signed URLs from server)
