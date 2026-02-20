-- Web Boss - Database Schema
-- Nigeria-first link-in-bio + mini landing page builder
-- 
-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- Then run the RLS policies from schema-rls.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reserved handles list
CREATE TABLE IF NOT EXISTS reserved_handles (
  handle TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert reserved handles
INSERT INTO reserved_handles (handle) VALUES
  ('admin'), ('app'), ('login'), ('signup'), ('pricing'), ('api'), 
  ('support'), ('help'), ('contact'), ('about'), ('terms'), ('privacy'),
  ('blog'), ('docs'), ('status'), ('webboss'), ('www'), ('mail'),
  ('ftp'), ('localhost'), ('dashboard'), ('auth'), ('callback'),
  ('settings'), ('pages'), ('analytics'), ('domains'), ('themes'),
  ('onboarding'), ('new'), ('editor'), ('public'), ('static'),
  ('assets'), ('cdn'), ('img'), ('images'), ('uploads'), ('media'),
  ('admin'), ('root'), ('system'), ('internal'), ('test')
ON CONFLICT (handle) DO NOTHING;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone_e164 TEXT,
  country_code TEXT DEFAULT 'NG',
  timezone TEXT DEFAULT 'Africa/Lagos',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE (Feature gating only, no payments yet)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ============================================================================
-- PAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  title TEXT,
  bio TEXT,
  avatar_path TEXT,
  theme_id UUID,
  theme_preset TEXT DEFAULT 'clean',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  custom_domain TEXT UNIQUE,
  custom_domain_verified BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT handle_format CHECK (
    handle ~ '^[a-z0-9_]{3,30}$'
  )
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pages_handle ON pages(handle);
CREATE INDEX IF NOT EXISTS idx_pages_owner_id ON pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_pages_custom_domain ON pages(custom_domain) WHERE custom_domain IS NOT NULL;

-- ============================================================================
-- THEMES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tokens JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_themes_owner_id ON themes(owner_id);

-- ============================================================================
-- PAGE BLOCKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'link', 
    'whatsapp_cta', 
    'product', 
    'social_row', 
    'embed', 
    'contact_form',
    'announcement',
    'text',
    'divider'
  )),
  settings JSONB NOT NULL DEFAULT '{}'::JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id_sort ON page_blocks(page_id, sort_order);

-- ============================================================================
-- LEADS TABLE (Contact form submissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  source_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_page_id_created ON leads(page_id, created_at DESC);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'link_click')),
  block_id UUID REFERENCES page_blocks(id) ON DELETE SET NULL,
  meta JSONB NOT NULL DEFAULT '{}'::JSONB,
  session_id TEXT,
  ip_hash TEXT,
  referrer TEXT,
  device_type TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_page_id_created ON analytics_events(page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id, created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_blocks_updated_at ON page_blocks;
CREATE TRIGGER update_page_blocks_updated_at
  BEFORE UPDATE ON page_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Create default free subscription
  INSERT INTO subscriptions (owner_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Validate handle is not reserved
CREATE OR REPLACE FUNCTION check_handle_not_reserved()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM reserved_handles WHERE handle = NEW.handle) THEN
    RAISE EXCEPTION 'Handle "%" is reserved and cannot be used', NEW.handle;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check reserved handles on insert/update
DROP TRIGGER IF EXISTS validate_page_handle ON pages;
CREATE TRIGGER validate_page_handle
  BEFORE INSERT OR UPDATE OF handle ON pages
  FOR EACH ROW
  EXECUTE FUNCTION check_handle_not_reserved();

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View for page analytics summary
CREATE OR REPLACE VIEW page_analytics_summary AS
SELECT 
  p.id AS page_id,
  p.handle,
  p.owner_id,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'page_view' THEN ae.id END) AS total_views,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'link_click' THEN ae.id END) AS total_clicks,
  COUNT(DISTINCT ae.session_id) AS unique_visitors,
  MAX(ae.created_at) AS last_activity
FROM pages p
LEFT JOIN analytics_events ae ON p.id = ae.page_id
GROUP BY p.id, p.handle, p.owner_id;

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Insert default theme presets (optional)
-- Users can reference these or create their own