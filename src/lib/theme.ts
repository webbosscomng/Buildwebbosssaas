export type ThemeTokens = {
  background: string; // hex
  foreground: string; // hex
  card: string; // hex
  cardForeground: string; // hex
  primary: string; // hex
  primaryForeground: string; // hex
  radius: string; // css length, e.g. "0.75rem"
};

export const THEME_TOKEN_PRESETS: Record<string, ThemeTokens> = {
  clean: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    cardForeground: '#09090b',
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    radius: '0.5rem',
  },
  midnight: {
    background: '#0b1220',
    foreground: '#f8fafc',
    card: '#111a2c',
    cardForeground: '#f8fafc',
    primary: '#3b82f6',
    primaryForeground: '#0b1220',
    radius: '0.75rem',
  },
  vibrant: {
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    primary: '#ec4899',
    primaryForeground: '#ffffff',
    radius: '1rem',
  },
};

export function tokensToCssVars(tokens: Partial<ThemeTokens>) {
  // These variables are referenced by src/styles/theme.css @theme inline mapping.
  // We override them per-page via inline style.
  const style: Record<string, string> = {};
  if (tokens.background) style['--background'] = tokens.background;
  if (tokens.foreground) style['--foreground'] = tokens.foreground;
  if (tokens.card) style['--card'] = tokens.card;
  if (tokens.cardForeground) style['--card-foreground'] = tokens.cardForeground;
  if (tokens.primary) style['--primary'] = tokens.primary;
  if (tokens.primaryForeground) style['--primary-foreground'] = tokens.primaryForeground;
  if (tokens.radius) style['--radius'] = tokens.radius;
  return style;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hexA: string, hexB: string) {
  const l1 = luminance(hexA);
  const l2 = luminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

