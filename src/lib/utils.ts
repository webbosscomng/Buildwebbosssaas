/**
 * Nigeria-first utilities for Web Boss
 */

// Format Nigerian phone numbers for WhatsApp
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 234 (Nigeria country code)
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  }
  
  // If doesn't start with country code, add Nigeria code
  if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  
  return cleaned;
}

// Generate WhatsApp link
export function generateWhatsAppLink(phone: string, message?: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

// Format currency (NGN)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Validate handle format
export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9_]{3,30}$/.test(handle);
}

// Reserved handles list
export const RESERVED_HANDLES = [
  'admin', 'app', 'login', 'signup', 'pricing', 'api',
  'support', 'help', 'contact', 'about', 'terms', 'privacy',
  'blog', 'docs', 'status', 'webboss', 'www', 'mail',
  'ftp', 'localhost', 'dashboard', 'auth', 'callback',
  'settings', 'pages', 'analytics', 'domains', 'themes',
  'onboarding', 'new', 'editor', 'public', 'static',
  'assets', 'cdn', 'img', 'images', 'uploads', 'media',
  'root', 'system', 'internal', 'test',
];

// Check if handle is reserved
export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.includes(handle.toLowerCase());
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate session ID for analytics
export function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID from sessionStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = sessionStorage.getItem('wb_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('wb_session_id', sessionId);
  }
  return sessionId;
}

// Detect device type
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Hash IP address (for privacy-compliant analytics)
export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Format date relative
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return then.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Get YouTube video ID from URL
export function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Get TikTok video ID from URL
export function getTikTokVideoId(url: string): string | null {
  const regex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxPages: 1,
    maxBlocks: 10,
    analyticsRetentionDays: 7,
    customDomain: false,
    removeWatermark: false,
  },
  pro: {
    maxPages: 10,
    maxBlocks: 100,
    analyticsRetentionDays: 365,
    customDomain: true,
    removeWatermark: true,
  },
};

// Check if user can perform action based on plan
export function canPerformAction(
  plan: 'free' | 'pro',
  action: keyof typeof PLAN_LIMITS.free
): boolean {
  return PLAN_LIMITS[plan][action] as boolean;
}
