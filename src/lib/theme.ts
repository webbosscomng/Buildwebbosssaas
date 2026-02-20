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
