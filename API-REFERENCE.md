# Web Boss API Reference

All API endpoints are prefixed with:
```
https://[PROJECT_ID].supabase.co/functions/v1/make-server-49cc7ee6
```

## Authentication

Most endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer [ACCESS_TOKEN]
```

For public endpoints, use the anonymous key:
```
Authorization: Bearer [ANON_KEY]
```

---

## Endpoints

### Auth

#### POST /auth/signup
Create a new user account.

**Authentication:** None (public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-02-20T10:00:00Z"
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Email already exists

**Notes:**
- Email is automatically confirmed (no verification email sent)
- Profile and free subscription are auto-created via database trigger

---

### Handles

#### GET /handles/:handle/available
Check if a handle is available for registration.

**Authentication:** None (public)

**Parameters:**
- `handle` (path): The handle to check (3-30 chars, lowercase, numbers, underscores)

**Response (200):**
```json
{
  "available": true
}
```

or

```json
{
  "available": false,
  "reason": "taken" | "reserved" | "invalid_format"
}
```

**Example:**
```
GET /handles/johndoe/available
```

**Notes:**
- Handle format is validated: `^[a-z0-9_]{3,30}$`
- Reserved handles are blocked (admin, api, app, etc.)
- Case-insensitive (all handles stored lowercase)

---

### Analytics

#### POST /analytics/event
Log an analytics event (page view or link click).

**Authentication:** Anonymous key (public)

**Request Body:**
```json
{
  "page_id": "uuid",
  "event_type": "page_view" | "link_click",
  "block_id": "uuid (optional, for link_click)",
  "meta": {
    "handle": "johndoe",
    "custom_data": "value"
  },
  "session_id": "session_123456"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- 400: Missing required fields
- 500: Failed to log event

**Privacy:**
- IP address is hashed (SHA-256) before storage
- User agent and referrer captured for device type detection
- No PII stored

**Example:**
```javascript
await fetch('/analytics/event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [ANON_KEY]'
  },
  body: JSON.stringify({
    page_id: 'abc-123',
    event_type: 'page_view',
    session_id: 'session_xyz',
    meta: {}
  })
});
```

---

#### GET /analytics/:pageId/summary
Get analytics summary for a page.

**Authentication:** Required (user must own the page)

**Parameters:**
- `pageId` (path): The page UUID
- `days` (query): Number of days to include (default: 7)

**Response (200):**
```json
{
  "summary": {
    "total_views": 150,
    "total_clicks": 45,
    "unique_visitors": 78
  },
  "by_day": {
    "2026-02-20": { "views": 30, "clicks": 10 },
    "2026-02-19": { "views": 25, "clicks": 8 }
  }
}
```

**Errors:**
- 401: Unauthorized (not logged in)
- 403: Forbidden (page owned by different user)
- 500: Failed to fetch analytics

**Example:**
```
GET /analytics/abc-123/summary?days=30
```

**Notes:**
- Only shows data for pages owned by authenticated user
- Free plan: max 7 days
- Pro plan: max 365 days

---

### Storage

#### POST /storage/avatar
Upload an avatar image for a page.

**Authentication:** Required

**Request:** Multipart form data

**Form Fields:**
- `file`: Image file (PNG, JPEG, GIF, WebP, max 5MB)
- `pageId`: Page UUID

**Response (200):**
```json
{
  "path": "user-id/page-id/avatar.png",
  "url": "https://...signed-url..."
}
```

**Errors:**
- 401: Unauthorized
- 400: Missing file or pageId
- 403: User doesn't own the page
- 500: Upload failed

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('pageId', 'abc-123');

const response = await fetch('/storage/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const { url } = await response.json();
```

**Notes:**
- Images are stored in private bucket
- Signed URLs valid for 1 year
- Files are auto-replaced (upsert mode)

---

#### GET /storage/avatar/:userId/:pageId/*
Get a signed URL for an avatar.

**Authentication:** None (public)

**Parameters:**
- `userId` (path): User UUID
- `pageId` (path): Page UUID
- `*` (path): Filename (e.g., `avatar.png`)

**Response (200):**
```json
{
  "url": "https://...signed-url..."
}
```

**Errors:**
- 404: File not found
- 500: Failed to generate URL

**Example:**
```
GET /storage/avatar/user-123/page-456/avatar.png
```

**Notes:**
- Signed URLs valid for 1 hour
- Public endpoint (no auth required)
- Returns 404 if file doesn't exist

---

### Health Check

#### GET /health
Check server health status.

**Authentication:** None

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T10:00:00.000Z"
}
```

---

#### GET /status
Get detailed server status.

**Authentication:** None

**Response (200):**
```json
{
  "status": "ok",
  "service": "Web Boss API",
  "version": "1.0.0",
  "timestamp": "2026-02-20T10:00:00.000Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` Bad Request: Invalid input
- `401` Unauthorized: Not logged in
- `403` Forbidden: Access denied
- `404` Not Found: Resource doesn't exist
- `500` Internal Server Error: Server-side error

---

## Rate Limiting

Currently, there are **no rate limits** implemented. For production, consider:

- 100 requests/minute per IP for anonymous endpoints
- 1000 requests/minute per user for authenticated endpoints
- 10 uploads/hour per user for avatar uploads

---

## Frontend API Client

Use the provided `/src/lib/api.ts` client for easier API calls:

```typescript
import { 
  checkHandleAvailability, 
  logAnalyticsEvent,
  getAnalyticsSummary,
  uploadAvatar 
} from '../lib/api';

// Check handle
const result = await checkHandleAvailability('johndoe');
console.log(result.available); // true or false

// Log event
await logAnalyticsEvent({
  page_id: 'abc-123',
  event_type: 'page_view',
  session_id: getSessionId()
});

// Get analytics
const analytics = await getAnalyticsSummary('abc-123', 30);
console.log(analytics.summary.total_views);

// Upload avatar
const { url } = await uploadAvatar(file, 'page-123');
```

---

## Direct Supabase Access

For database operations, use the Supabase client directly:

```typescript
import { createClient } from '../lib/supabase';

const supabase = createClient();

// Get user's pages
const { data: pages } = await supabase
  .from('pages')
  .select('*')
  .eq('owner_id', user.id);

// Create a block
const { data: block } = await supabase
  .from('page_blocks')
  .insert({
    page_id: 'abc-123',
    type: 'link',
    settings: { title: 'My Link', url: 'https://example.com' },
    sort_order: 0
  })
  .select()
  .single();

// Update page
const { error } = await supabase
  .from('pages')
  .update({ is_published: true })
  .eq('id', 'abc-123');
```

---

## WebSocket / Real-time (Future)

Currently not implemented, but Supabase Realtime can be used for:

- Live analytics updates
- Collaborative editing
- Real-time visitor count
- Live chat support

Example future implementation:
```typescript
const subscription = supabase
  .channel('analytics')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'analytics_events',
    filter: `page_id=eq.${pageId}`
  }, (payload) => {
    console.log('New event:', payload);
  })
  .subscribe();
```

---

## Testing

### Manual Testing

Use `curl` or Postman to test endpoints:

```bash
# Check handle availability
curl https://[PROJECT_ID].supabase.co/functions/v1/make-server-49cc7ee6/handles/johndoe/available

# Log analytics event
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{"page_id":"abc-123","event_type":"page_view","session_id":"test"}' \
  https://[PROJECT_ID].supabase.co/functions/v1/make-server-49cc7ee6/analytics/event
```

### Automated Testing

Consider adding tests for:
- Handle validation logic
- Analytics aggregation
- RLS policy enforcement
- File upload limits
- Error handling

---

## Best Practices

1. **Always validate inputs** client-side before API calls
2. **Handle errors gracefully** with user-friendly messages
3. **Use session IDs** consistently for analytics
4. **Cache avatar URLs** to reduce signed URL requests
5. **Debounce handle checks** to avoid excessive API calls
6. **Log errors** to console for debugging

---

## Migration Guide

If you need to modify the API:

1. Update server code in `/supabase/functions/server/index.tsx`
2. Update API client in `/src/lib/api.ts`
3. Update TypeScript types in `/src/lib/supabase.ts`
4. Test thoroughly before deploying
5. Document breaking changes

---

## Support

For API issues:
1. Check browser console for errors
2. Verify authentication token is valid
3. Check Supabase Edge Function logs
4. Ensure RLS policies allow the operation

**Need help?** Contact support@webboss.com.ng
