import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import process from "node:process";
import crypto from "node:crypto";

const app = new Hono();

// Initialize Supabase clients
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Service role client (for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper to get authenticated user
async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================================================
// STORAGE INITIALIZATION
// ============================================================================

// Initialize storage bucket on startup
async function initializeStorage() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketName = 'avatars-webboss-49cc7ee6';
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      });
      console.log(`Created storage bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
}

// Initialize on startup
initializeStorage();

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Sign up
app.post('/make-server-49cc7ee6/auth/signup', async (c) => {
  try {
    const { email, password, full_name } = await c.req.json();
    
    if (!email || !password || !full_name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true, // Auto-confirm since email server not configured
    });
    
    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.error('Signup route error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// HANDLE VALIDATION
// ============================================================================

// Check handle availability
app.get('/make-server-49cc7ee6/handles/:handle/available', async (c) => {
  try {
    const handle = c.req.param('handle').toLowerCase();
    
    // Check format
    if (!/^[a-z0-9_]{3,30}$/.test(handle)) {
      return c.json({ available: false, reason: 'invalid_format' });
    }
    
    // Check if reserved
    const { data: reserved } = await supabaseAdmin
      .from('reserved_handles')
      .select('handle')
      .eq('handle', handle)
      .single();
    
    if (reserved) {
      return c.json({ available: false, reason: 'reserved' });
    }
    
    // Check if taken
    const { data: existing } = await supabaseAdmin
      .from('pages')
      .select('handle')
      .eq('handle', handle)
      .single();
    
    if (existing) {
      return c.json({ available: false, reason: 'taken' });
    }
    
    return c.json({ available: true });
  } catch (error) {
    console.error('Handle check error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

// Log analytics event (public)
app.post('/make-server-49cc7ee6/analytics/event', async (c) => {
  try {
    const { page_id, event_type, block_id, meta, session_id } = await c.req.json();
    
    if (!page_id || !event_type) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get IP and hash it
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    
    // Get user agent and referrer
    const userAgent = c.req.header('user-agent') || '';
    const referrer = c.req.header('referer') || '';
    
    // Detect device type
    let deviceType = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry/.test(userAgent)) {
      deviceType = 'mobile';
    }
    
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        page_id,
        event_type,
        block_id: block_id || null,
        meta: meta || {},
        session_id: session_id || null,
        ip_hash: ipHash,
        referrer: referrer || null,
        device_type: deviceType,
      });
    
    if (error) {
      console.error('Analytics insert error:', error);
      return c.json({ error: 'Failed to log event' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Analytics event error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get analytics summary for page (authenticated)
app.get('/make-server-49cc7ee6/analytics/:pageId/summary', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const pageId = c.req.param('pageId');
    const days = parseInt(c.req.query('days') || '7');
    
    // Verify ownership
    const { data: page } = await supabaseAdmin
      .from('pages')
      .select('owner_id')
      .eq('id', pageId)
      .single();
    
    if (!page || page.owner_id !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    // Get events from last N days
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const { data: events, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('page_id', pageId)
      .gte('created_at', since.toISOString());
    
    if (error) {
      console.error('Analytics fetch error:', error);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
    
    // Calculate summary
    const views = events.filter(e => e.event_type === 'page_view').length;
    const clicks = events.filter(e => e.event_type === 'link_click').length;
    const uniqueVisitors = new Set(events.map(e => e.session_id).filter(Boolean)).size;
    
    // Group by day
    const byDay: Record<string, { views: number; clicks: number }> = {};
    events.forEach(event => {
      const day = event.created_at.split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { views: 0, clicks: 0 };
      }
      if (event.event_type === 'page_view') byDay[day].views++;
      if (event.event_type === 'link_click') byDay[day].clicks++;
    });
    
    return c.json({
      summary: {
        total_views: views,
        total_clicks: clicks,
        unique_visitors: uniqueVisitors,
      },
      by_day: byDay,
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// STORAGE ROUTES
// ============================================================================

// Upload avatar (authenticated)
app.post('/make-server-49cc7ee6/storage/avatar', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const pageId = formData.get('pageId') as string;
    
    if (!file || !pageId) {
      return c.json({ error: 'Missing file or pageId' }, 400);
    }
    
    // Verify page ownership
    const { data: page } = await supabaseAdmin
      .from('pages')
      .select('owner_id')
      .eq('id', pageId)
      .single();
    
    if (!page || page.owner_id !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    // Upload to storage
    const fileName = `${user.id}/${pageId}/avatar.${file.name.split('.').pop()}`;
    const { data, error } = await supabaseAdmin.storage
      .from('avatars-webboss-49cc7ee6')
      .upload(fileName, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: true,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabaseAdmin.storage
      .from('avatars-webboss-49cc7ee6')
      .createSignedUrl(fileName, 31536000);
    
    return c.json({ 
      path: fileName,
      url: urlData?.signedUrl 
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get signed URL for avatar
app.get('/make-server-49cc7ee6/storage/avatar/:userId/:pageId/*', async (c) => {
  try {
    const userId = c.req.param('userId');
    const pageId = c.req.param('pageId');
    const fileName = c.req.param('*');
    
    const path = `${userId}/${pageId}/${fileName}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('avatars-webboss-49cc7ee6')
      .createSignedUrl(path, 3600); // 1 hour
    
    if (error) {
      console.error('Signed URL error:', error);
      return c.json({ error: 'Failed to get URL' }, 404);
    }
    
    return c.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Get avatar URL error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-49cc7ee6/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/make-server-49cc7ee6/status", (c) => {
  return c.json({ 
    status: "ok",
    service: "Web Boss API",
    version: "1.0.0",
    timestamp: new Date().toISOString() 
  });
});

Deno.serve(app.fetch);