import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from './auth';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-49cc7ee6`;

// Helper to make authenticated requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
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

// Check handle availability
export async function checkHandleAvailability(handle: string): Promise<{
  available: boolean;
  reason?: string;
}> {
  return fetchAPI(`/handles/${handle}/available`);
}

// Log analytics event
export async function logAnalyticsEvent(data: {
  page_id: string;
  event_type: 'page_view' | 'link_click';
  block_id?: string;
  meta?: Record<string, any>;
  session_id?: string;
}): Promise<{ success: boolean }> {
  return fetchAPI('/analytics/event', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get analytics summary
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
  return fetchAPI(`/analytics/${pageId}/summary?days=${days}`);
}

// Upload avatar
export async function uploadAvatar(file: File, pageId: string): Promise<{
  path: string;
  url: string;
}> {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pageId', pageId);
  
  const response = await fetch(`${API_BASE_URL}/storage/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || publicAnonKey}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
}

// Get signed URL for avatar
export async function getAvatarUrl(path: string): Promise<string> {
  const response = await fetchAPI(`/storage/avatar/${path}`);
  return response.url;
}
