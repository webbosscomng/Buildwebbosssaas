import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from './auth';
import { createClient } from './supabase';
import { RESERVED_HANDLES } from './utils';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-49cc7ee6`;

// Helper to make authenticated requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Supabase Functions expects `apikey` always; `Authorization` only for user JWT.
  headers['apikey'] = publicAnonKey;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set JSON content-type when body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Check handle availability (authoritative check via Edge Function)
export async function checkHandleAvailability(handle: string): Promise<{
  available: boolean;
  reason?: string;
}> {
  const normalized = handle.toLowerCase().trim();

  // Fast local feedback for reserved words, but server remains authoritative.
  if (RESERVED_HANDLES.includes(normalized)) {
    return { available: false, reason: 'reserved' };
  }

  // Edge function returns: { available: boolean, reason?: 'invalid_format'|'reserved'|'taken' }
  return fetchAPI(`/handles/${encodeURIComponent(normalized)}/available`, {
    method: 'GET',
  });
}

// Log analytics event (using Supabase directly)
export async function logAnalyticsEvent(data: {
  page_id: string;
  event_type: 'page_view' | 'link_click';
  block_id?: string;
  meta?: Record<string, any>;
  session_id?: string;
}): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        page_id: data.page_id,
        event_type: data.event_type,
        block_id: data.block_id || null,
        meta: data.meta || {},
        session_id: data.session_id || null,
      });

    if (error) {
      console.error('Analytics event error:', error);
      // Don't throw - analytics shouldn't break the app
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging analytics event:', error);
    return { success: false };
  }
}

// Get analytics summary (using Supabase directly)
export async function getAnalyticsSummary(
  pageId: string,
  days: number = 7
): Promise<{
  summary: {
    total_views: number;
    total_clicks: number;
    unique_visitors: number;
  };
  by_day: Record<string, { views: number; clicks: number }>;
}> {
  try {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all events for the time period
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('page_id', pageId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Analytics summary error:', error);
      throw error;
    }

    // Calculate summary
    const views = events?.filter(e => e.event_type === 'page_view') || [];
    const clicks = events?.filter(e => e.event_type === 'link_click') || [];
    const uniqueVisitors = new Set(events?.map(e => e.session_id).filter(Boolean)).size;

    // Group by day
    const by_day: Record<string, { views: number; clicks: number }> = {};
    events?.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!by_day[date]) {
        by_day[date] = { views: 0, clicks: 0 };
      }
      if (event.event_type === 'page_view') {
        by_day[date].views++;
      } else if (event.event_type === 'link_click') {
        by_day[date].clicks++;
      }
    });

    return {
      summary: {
        total_views: views.length,
        total_clicks: clicks.length,
        unique_visitors: uniqueVisitors,
      },
      by_day,
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    // Return empty data on error
    return {
      summary: {
        total_views: 0,
        total_clicks: 0,
        unique_visitors: 0,
      },
      by_day: {},
    };
  }
}

// Upload avatar (private bucket + signed URLs via Edge Function)
export async function uploadAvatar(file: File, pageId: string): Promise<{
  path: string;
  url: string;
}> {
  const form = new FormData();
  form.append('file', file);
  form.append('pageId', pageId);

  return fetchAPI('/storage/avatar', {
    method: 'POST',
    body: form,
  });
}

// Get signed URL for avatar
export async function getAvatarUrl(path: string): Promise<string> {
  // Backward compatible: if path is already a URL, return it.
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  // Edge Function route expects: /storage/avatar/:userId/:pageId/*
  // Stored path format: `${userId}/${pageId}/avatar.ext`
  const [userId, pageId, ...rest] = path.split('/');
  const fileName = rest.join('/');
  if (!userId || !pageId || !fileName) {
    throw new Error('Invalid avatar path');
  }

  const result = await fetchAPI(`/storage/avatar/${encodeURIComponent(userId)}/${encodeURIComponent(pageId)}/${encodeURIComponent(fileName)}`, {
    method: 'GET',
  });

  return result.url;
}

// Upload product image to Supabase Storage (public bucket)
export async function uploadProductImage(file: File, pageId: string): Promise<{ path: string; url: string }> {
  const supabase = createClient();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const filePath = `${pageId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return { path: filePath, url: data.publicUrl };
}