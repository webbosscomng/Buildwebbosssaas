import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Supabase client singleton for frontend use
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
}

// Database types
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_e164: string | null;
  country_code: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  owner_id: string;
  handle: string;
  title: string | null;
  bio: string | null;
  avatar_path: string | null;
  theme_id: string | null;
  theme_preset: string;
  is_published: boolean;
  published_at: string | null;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageBlock {
  id: string;
  page_id: string;
  type: 'link' | 'whatsapp_cta' | 'product' | 'social_row' | 'embed' | 'contact_form' | 'announcement' | 'text' | 'divider';
  settings: Record<string, any>;
  sort_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  owner_id: string;
  name: string;
  tokens: Record<string, any>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  page_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source_url: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  page_id: string;
  event_type: 'page_view' | 'link_click';
  block_id: string | null;
  meta: Record<string, any>;
  session_id: string | null;
  ip_hash: string | null;
  referrer: string | null;
  device_type: string | null;
  country_code: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  owner_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'expired';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
